/**
 * Rate limiting middleware
 * Provides rate limiting functionality for API routes
 * 
 * @module RateLimitMiddleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@airdrop-finder/shared';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
  message?: string; // Custom error message
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Default rate limit configuration
 */
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
};

/**
 * Create rate limiter middleware
 * 
 * @param config - Rate limit configuration
 * @returns Middleware function that checks rate limits
 * 
 * @example
 * ```typescript
 * const rateLimiter = createRateLimiter({
 *   windowMs: 60 * 1000,
 *   maxRequests: 10,
 * });
 * 
 * const handler = rateLimiter(async (request) => {
 *   return NextResponse.json({ success: true });
 * });
 * ```
 */
export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return function rateLimiter<T extends any[]>(
    handler: (...args: T) => Promise<NextResponse>
  ): (...args: T) => Promise<NextResponse> {
    return async (...args: T): Promise<NextResponse> => {
      const request = args[0] as NextRequest;
      
      // Generate rate limit key
      const key = finalConfig.keyGenerator
        ? finalConfig.keyGenerator(request)
        : generateDefaultKey(request);

      // Check rate limit
      const result = checkRateLimit(key, finalConfig);

      if (!result.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: finalConfig.message || 'Rate limit exceeded',
              retryAfter: result.retryAfter,
            },
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': finalConfig.maxRequests.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toString(),
              'Retry-After': result.retryAfter?.toString() || '60',
            },
          }
        );
      }

      // Add rate limit headers
      const response = await handler(...args);
      response.headers.set('X-RateLimit-Limit', finalConfig.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

      return response;
    };
  };
}

/**
 * Check rate limit for a key
 */
function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const cacheKey = `rate-limit:${key}`;
  const now = Date.now();
  const windowStart = Math.floor(now / config.windowMs) * config.windowMs;
  const resetTime = windowStart + config.windowMs;

  // Get current count
  const cached = cache.get<{ count: number; resetTime: number }>(cacheKey);
  
  if (!cached || cached.resetTime < now) {
    // New window or expired
    cache.set(cacheKey, { count: 1, resetTime }, config.windowMs);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Increment count
  const newCount = cached.count + 1;
  cache.set(cacheKey, { count: newCount, resetTime: cached.resetTime }, config.windowMs);

  if (newCount > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: cached.resetTime,
      retryAfter: Math.ceil((cached.resetTime - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - newCount,
    resetTime: cached.resetTime,
  };
}

/**
 * Generate default rate limit key from request
 */
function generateDefaultKey(request: NextRequest): string {
  // Use IP address or user identifier
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const path = request.nextUrl.pathname;
  
  return `${ip}:${path}`;
}

/**
 * Strict rate limiter for sensitive endpoints
 */
export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  message: 'Too many requests. Please try again later.',
});

/**
 * Standard rate limiter for general endpoints
 */
export const standardRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
});

