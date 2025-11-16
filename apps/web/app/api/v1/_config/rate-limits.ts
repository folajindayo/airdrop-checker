/**
 * Rate limiting configuration for API endpoints
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

/**
 * Default rate limits by endpoint type
 */
export const rateLimits: Record<string, RateLimitConfig> = {
  // Public endpoints - more restrictive
  public: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many requests from this IP, please try again later',
  },

  // Authenticated endpoints - more generous
  authenticated: {
    maxRequests: 1000,
    windowMs: 60 * 1000, // 1 minute
  },

  // Premium tier - highest limits
  premium: {
    maxRequests: 10000,
    windowMs: 60 * 1000, // 1 minute
  },

  // Specific endpoint overrides
  'airdrops/check': {
    maxRequests: 50,
    windowMs: 60 * 1000,
    message: 'Too many airdrop checks, please wait before trying again',
  },

  'transactions/analyze': {
    maxRequests: 20,
    windowMs: 60 * 1000,
    message: 'Transaction analysis rate limit exceeded',
  },

  'portfolio/compare': {
    maxRequests: 30,
    windowMs: 60 * 1000,
  },

  health: {
    maxRequests: 1000,
    windowMs: 60 * 1000,
  },
};

/**
 * Get rate limit for endpoint
 */
export function getRateLimitForEndpoint(
  endpoint: string,
  tier: 'public' | 'authenticated' | 'premium' = 'public'
): RateLimitConfig {
  // Check for specific endpoint override
  if (rateLimits[endpoint]) {
    return rateLimits[endpoint];
  }

  // Return tier-based limit
  return rateLimits[tier];
}

