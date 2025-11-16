/**
 * Cache Service
 * Centralized caching layer for application data
 */

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  prefix?: string;
}

export class CacheService {
  private cache: Map<string, { value: any; expires: number }> = new Map();
  private defaultTTL: number = 60000; // 1 minute

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl || this.defaultTTL;
    const fullKey = options?.prefix ? `${options.prefix}:${key}` : key;
    
    this.cache.set(fullKey, {
      value,
      expires: Date.now() + ttl,
    });
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get or set value (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }
    
    const value = await factory();
    await this.set(key, value, options);
    
    return value;
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hits: number;
    misses: number;
  } {
    return {
      size: this.cache.size,
      hits: 0, // TODO: Implement hit tracking
      misses: 0, // TODO: Implement miss tracking
    };
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }
}

export const cacheService = new CacheService();

// Auto-clear expired entries every minute
setInterval(() => cacheService.clearExpired(), 60000);

