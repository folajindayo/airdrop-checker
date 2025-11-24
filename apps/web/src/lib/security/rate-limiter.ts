/**
 * Rate limiting implementation
 * Provides flexible rate limiting for API endpoints
 */

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum requests allowed */
  limit: number;
  /** Time window in seconds */
  window: number;
  /** Identifier for the limit (e.g., IP address, API key) */
  identifier: string;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in window */
  remaining: number;
  /** When the limit resets (Unix timestamp) */
  resetAt: number;
  /** Total limit */
  limit: number;
}

/**
 * In-memory store for rate limits
 * In production, use Redis or similar
 */
class RateLimitStore {
  private store = new Map<string, { count: number; resetAt: number }>();

  /**
   * Check and increment rate limit
   */
  checkLimit(config: RateLimitConfig): RateLimitResult {
    const key = `${config.identifier}`;
    const now = Date.now();
    const resetAt = now + config.window * 1000;

    let entry = this.store.get(key);

    // Create new entry if doesn't exist or expired
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt };
      this.store.set(key, entry);
    }

    // Increment count
    entry.count++;

    const allowed = entry.count <= config.limit;
    const remaining = Math.max(0, config.limit - entry.count);

    return {
      allowed,
      remaining,
      resetAt: entry.resetAt,
      limit: config.limit,
    };
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get current count for identifier
   */
  getCount(identifier: string): number {
    const entry = this.store.get(identifier);
    if (!entry || entry.resetAt < Date.now()) {
      return 0;
    }
    return entry.count;
  }
}

/**
 * Singleton rate limit store
 */
export const rateLimitStore = new RateLimitStore();

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => rateLimitStore.cleanup(), 5 * 60 * 1000);
}

/**
 * Rate limit presets for common use cases
 */
export const RATE_LIMITS = {
  /** Strict limit for expensive operations */
  STRICT: { limit: 10, window: 3600 }, // 10 per hour
  
  /** Standard limit for normal API routes */
  STANDARD: { limit: 100, window: 3600 }, // 100 per hour
  
  /** Relaxed limit for read-only operations */
  RELAXED: { limit: 500, window: 3600 }, // 500 per hour
  
  /** Per-minute limits for real-time operations */
  PER_MINUTE: { limit: 60, window: 60 }, // 60 per minute
  
  /** Per-second limits for burst protection */
  PER_SECOND: { limit: 10, window: 1 }, // 10 per second
} as const;

/**
 * Create rate limiter function
 * 
 * @param config - Rate limit configuration
 * @returns Rate limiter function
 * 
 * @example
 * ```typescript
 * const limiter = createRateLimiter({ limit: 100, window: 3600 });
 * const result = limiter('user-ip-address');
 * if (!result.allowed) {
 *   throw new RateLimitError();
 * }
 * ```
 */
export function createRateLimiter(config: Omit<RateLimitConfig, 'identifier'>) {
  return (identifier: string): RateLimitResult => {
    return rateLimitStore.checkLimit({ ...config, identifier });
  };
}

/**
 * Rate limit by IP address
 * 
 * @param ipAddress - Client IP address
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimitByIP(
  ipAddress: string,
  config: Omit<RateLimitConfig, 'identifier'> = RATE_LIMITS.STANDARD
): RateLimitResult {
  return rateLimitStore.checkLimit({
    ...config,
    identifier: `ip:${ipAddress}`,
  });
}

/**
 * Rate limit by wallet address
 * 
 * @param address - Wallet address
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimitByAddress(
  address: string,
  config: Omit<RateLimitConfig, 'identifier'> = RATE_LIMITS.STANDARD
): RateLimitResult {
  return rateLimitStore.checkLimit({
    ...config,
    identifier: `address:${address.toLowerCase()}`,
  });
}

/**
 * Rate limit by endpoint
 * 
 * @param endpoint - API endpoint
 * @param identifier - User identifier (IP, address, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimitByEndpoint(
  endpoint: string,
  identifier: string,
  config: Omit<RateLimitConfig, 'identifier'> = RATE_LIMITS.STANDARD
): RateLimitResult {
  return rateLimitStore.checkLimit({
    ...config,
    identifier: `${endpoint}:${identifier}`,
  });
}

/**
 * Composite rate limiter
 * Applies multiple rate limits and returns the most restrictive
 * 
 * @param limiters - Array of rate limit results
 * @returns Combined rate limit result
 * 
 * @example
 * ```typescript
 * const result = compositeRateLimit([
 *   rateLimitByIP(ip, RATE_LIMITS.PER_SECOND),
 *   rateLimitByAddress(address, RATE_LIMITS.STANDARD),
 * ]);
 * ```
 */
export function compositeRateLimit(limiters: RateLimitResult[]): RateLimitResult {
  const blocked = limiters.find((l) => !l.allowed);
  
  if (blocked) {
    return blocked;
  }

  // Return the most restrictive (lowest remaining)
  return limiters.reduce((prev, curr) => 
    curr.remaining < prev.remaining ? curr : prev
  );
}

/**
 * Get rate limit status without incrementing
 * 
 * @param identifier - Identifier to check
 * @returns Current count
 */
export function getRateLimitStatus(identifier: string): number {
  return rateLimitStore.getCount(identifier);
}

/**
 * Reset rate limit for identifier
 * Useful for testing or manual overrides
 * 
 * @param identifier - Identifier to reset
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.clear();
}

