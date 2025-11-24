import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple in-memory rate limiter for API routes
 * In production, consider using Redis or similar for distributed systems
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store rate limit data in memory
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Optional custom key function to identify the requester
   * Defaults to IP address
   */
  keyGenerator?: (request: NextRequest) => string;
}

/**
 * Get the client identifier from the request
 */
function getClientKey(request: NextRequest, keyGenerator?: (req: NextRequest) => string): string {
  if (keyGenerator) {
    return keyGenerator(request);
  }

  // Try to get IP from various headers (for production with proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  
  // Include path to allow different limits per endpoint
  const path = new URL(request.url).pathname;
  
  return `${ip}-${path}`;
}

/**
 * Rate limit check function
 * Returns true if the request should be allowed, false if rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = getClientKey(request, config.keyGenerator);
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // First request or window expired, create new entry
    const resetTime = now + windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetTime,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Window still active
  if (entry.count < config.maxRequests) {
    // Under the limit
    entry.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  // Over the limit
  return {
    allowed: false,
    remaining: 0,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit middleware wrapper
 * Usage:
 * ```
 * export async function GET(request: NextRequest) {
 *   const rateLimitResult = await rateLimit(request, {
 *     maxRequests: 10,
 *     windowSeconds: 60
 *   });
 *   
 *   if (rateLimitResult) return rateLimitResult;
 *   
 *   // Continue with normal request handling
 * }
 * ```
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const result = checkRateLimit(request, config);

  // Add rate limit headers to response
  const headers = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  };

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  return null;
}

/**
 * Per-address rate limiter (useful for wallet-specific endpoints)
 */
export async function rateLimitByAddress(
  request: NextRequest,
  address: string,
  config: Omit<RateLimitConfig, 'keyGenerator'>
): Promise<NextResponse | null> {
  return rateLimit(request, {
    ...config,
    keyGenerator: () => `address-${address.toLowerCase()}`,
  });
}

/**
 * Preset rate limit configurations
 */
export const RATE_LIMITS = {
  // Strict limit for resource-intensive operations
  STRICT: {
    maxRequests: 5,
    windowSeconds: 60, // 5 requests per minute
  },
  // Standard limit for normal API endpoints
  STANDARD: {
    maxRequests: 30,
    windowSeconds: 60, // 30 requests per minute
  },
  // Lenient limit for lightweight operations
  LENIENT: {
    maxRequests: 100,
    windowSeconds: 60, // 100 requests per minute
  },
  // Per-address limits (for wallet-specific operations)
  PER_ADDRESS: {
    maxRequests: 10,
    windowSeconds: 300, // 10 requests per 5 minutes per address
  },
} as const;

