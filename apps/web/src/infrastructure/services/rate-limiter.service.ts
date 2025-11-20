/**
 * Rate Limiter Service
 * Request rate limiting with token bucket algorithm
 */

export interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class RateLimiterService {
  private records: Map<string, RateLimitRecord> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(config: RateLimiterConfig) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
  }

  /**
   * Check if request is allowed
   */
  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const record = this.records.get(key);

    if (!record || now > record.resetTime) {
      this.records.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * Execute with rate limiting
   */
  async execute<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const allowed = await this.checkLimit(key);
    
    if (!allowed) {
      throw new Error('Rate limit exceeded');
    }

    return fn();
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string): number {
    const record = this.records.get(key);
    
    if (!record || Date.now() > record.resetTime) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - record.count);
  }

  /**
   * Get reset time
   */
  getResetTime(key: string): number | null {
    const record = this.records.get(key);
    return record ? record.resetTime : null;
  }

  /**
   * Reset limit for key
   */
  reset(key: string): void {
    this.records.delete(key);
  }

  /**
   * Clear all limits
   */
  clearAll(): void {
    this.records.clear();
  }

  /**
   * Clean expired records
   */
  cleanExpired(): number {
    const now = Date.now();
    let count = 0;

    for (const [key, record] of this.records.entries()) {
      if (now > record.resetTime) {
        this.records.delete(key);
        count++;
      }
    }

    return count;
  }
}

// Singleton instances
export const apiRateLimiter = new RateLimiterService({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
});

export const userRateLimiter = new RateLimiterService({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
});

