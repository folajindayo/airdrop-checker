import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface RateLimitConfig {
  endpoint: string;
  limit: number;
  window: number; // seconds
  remaining: number;
  resetAt: number;
}

// Rate limit configurations per endpoint
const rateLimits: Record<string, { limit: number; window: number }> = {
  '/api/airdrop-check': { limit: 100, window: 3600 }, // 100 per hour
  '/api/portfolio': { limit: 50, window: 3600 },
  '/api/refresh': { limit: 10, window: 300 }, // 10 per 5 minutes
  '/api/batch': { limit: 20, window: 3600 },
  '/api/simulate': { limit: 30, window: 3600 },
  '/api/roi': { limit: 50, window: 3600 },
  '/api/export': { limit: 20, window: 3600 },
  '/api/reports': { limit: 10, window: 3600 },
  default: { limit: 1000, window: 86400 }, // 1000 per day
};

// In-memory rate limit tracking (in production, use Redis)
const rateLimitStore: Map<string, { count: number; resetAt: number }> = new Map();

/**
 * GET /api/rate-limit
 * Get rate limit information for an endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'default';
    const address = searchParams.get('address');

    const config = rateLimits[endpoint] || rateLimits.default;
    const key = address ? `${endpoint}:${address}` : endpoint;
    const current = rateLimitStore.get(key) || { count: 0, resetAt: Date.now() + config.window * 1000 };

    // Check if window expired
    if (Date.now() > current.resetAt) {
      current.count = 0;
      current.resetAt = Date.now() + config.window * 1000;
      rateLimitStore.set(key, current);
    }

    const remaining = Math.max(0, config.limit - current.count);
    const resetAt = current.resetAt;

    return NextResponse.json({
      endpoint,
      limit: config.limit,
      window: config.window,
      remaining,
      resetAt: new Date(resetAt).toISOString(),
      used: current.count,
    });
  } catch (error) {
    console.error('Rate limit API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch rate limit info',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to check and increment rate limit
 */
export function checkRateLimit(endpoint: string, address?: string): { allowed: boolean; remaining: number; resetAt: number } {
  const config = rateLimits[endpoint] || rateLimits.default;
  const key = address ? `${endpoint}:${address}` : endpoint;
  const current = rateLimitStore.get(key) || { count: 0, resetAt: Date.now() + config.window * 1000 };

  // Check if window expired
  if (Date.now() > current.resetAt) {
    current.count = 0;
    current.resetAt = Date.now() + config.window * 1000;
  }

  const allowed = current.count < config.limit;
  
  if (allowed) {
    current.count += 1;
    rateLimitStore.set(key, current);
  }

  return {
    allowed,
    remaining: Math.max(0, config.limit - current.count),
    resetAt: current.resetAt,
  };
}



