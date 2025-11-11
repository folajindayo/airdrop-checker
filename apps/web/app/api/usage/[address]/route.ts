import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface UsageStats {
  address: string;
  totalRequests: number;
  requestsByEndpoint: Record<string, number>;
  lastRequest: string;
  firstRequest: string;
  dailyUsage: Array<{ date: string; count: number }>;
}

// In-memory storage (in production, use database)
const usageStats: Map<string, UsageStats> = new Map();

/**
 * GET /api/usage/[address]
 * Get API usage statistics for an address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const stats = usageStats.get(normalizedAddress) || {
      address: normalizedAddress,
      totalRequests: 0,
      requestsByEndpoint: {},
      lastRequest: new Date().toISOString(),
      firstRequest: new Date().toISOString(),
      dailyUsage: [],
    };

    // Calculate rate limit info
    const rateLimit = {
      limit: 1000, // per day
      remaining: Math.max(0, 1000 - stats.totalRequests),
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({
      success: true,
      stats,
      rateLimit,
    });
  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch usage statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to track API usage (called by middleware or other endpoints)
 */
export function trackUsage(address: string, endpoint: string) {
  const normalizedAddress = address.toLowerCase();
  const stats = usageStats.get(normalizedAddress) || {
    address: normalizedAddress,
    totalRequests: 0,
    requestsByEndpoint: {},
    lastRequest: new Date().toISOString(),
    firstRequest: new Date().toISOString(),
    dailyUsage: [],
  };

  stats.totalRequests += 1;
  stats.requestsByEndpoint[endpoint] = (stats.requestsByEndpoint[endpoint] || 0) + 1;
  stats.lastRequest = new Date().toISOString();

  if (!stats.firstRequest) {
    stats.firstRequest = new Date().toISOString();
  }

  // Track daily usage
  const today = new Date().toISOString().split('T')[0];
  const dailyEntry = stats.dailyUsage.find((d) => d.date === today);
  if (dailyEntry) {
    dailyEntry.count += 1;
  } else {
    stats.dailyUsage.push({ date: today, count: 1 });
    // Keep only last 30 days
    if (stats.dailyUsage.length > 30) {
      stats.dailyUsage.shift();
    }
  }

  usageStats.set(normalizedAddress, stats);
}



