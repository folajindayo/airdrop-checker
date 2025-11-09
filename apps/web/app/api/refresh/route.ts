import { NextRequest, NextResponse } from 'next/server';
import { cache, RATE_LIMITS, isValidAddress } from '@airdrop-finder/shared';

// Store last refresh time per address
const refreshTimestamps = new Map<string, number>();

export const dynamic = 'force-dynamic';

/**
 * POST /api/refresh
 * Force refresh eligibility scan for an address
 * Rate-limited to prevent abuse
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    // Validate address
    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    // Check rate limit
    const lastRefresh = refreshTimestamps.get(normalizedAddress);
    const now = Date.now();

    if (lastRefresh) {
      const timeSinceLastRefresh = now - lastRefresh;
      
      if (timeSinceLastRefresh < RATE_LIMITS.REFRESH_COOLDOWN) {
        const remainingTime = Math.ceil(
          (RATE_LIMITS.REFRESH_COOLDOWN - timeSinceLastRefresh) / 1000
        );
        
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: `Please wait ${remainingTime} seconds before refreshing again`,
            remainingTime,
          },
          { status: 429 }
        );
      }
    }

    // Clear cache for this address
    const cacheKey = `airdrop-check:${normalizedAddress}`;
    cache.delete(cacheKey);

    // Update last refresh timestamp
    refreshTimestamps.set(normalizedAddress, now);

    // Clean up old timestamps (older than cooldown period)
    const cutoffTime = now - RATE_LIMITS.REFRESH_COOLDOWN;
    for (const [addr, timestamp] of refreshTimestamps.entries()) {
      if (timestamp < cutoffTime) {
        refreshTimestamps.delete(addr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cache cleared. Please fetch fresh data.',
      nextRefreshAvailable: now + RATE_LIMITS.REFRESH_COOLDOWN,
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to refresh data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

