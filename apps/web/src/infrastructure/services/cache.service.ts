/**
 * Cache Service
 * In-memory and persistent caching service
 */

export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
}

export class CacheService {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private readonly defaultTTL: number;
  private readonly maxSize: number;

  constructor(config: CacheConfig = {}) {
    this.cache = new Map();
    this.defaultTTL = config.ttl || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = config.maxSize || 1000;
  }

  /**
   * Set cache value
   */
  set(key: string, data: any, ttl?: number): void {
    // Check cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Get cache value
   */
  get<T = any>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;

    const age = Date.now() - item.timestamp;
    
    if (age > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get or set (if not exists)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, ttl);
    
    return data;
  }

  /**
   * Evict oldest entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < oldestTimestamp) {
        oldestTimestamp = value.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    let count = 0;
    const now = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    keys: number;
    oldestAge: number | null;
  } {
    let oldestAge: number | null = null;
    const now = Date.now();

    for (const value of this.cache.values()) {
      const age = now - value.timestamp;
      if (oldestAge === null || age > oldestAge) {
        oldestAge = age;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: this.cache.size,
      oldestAge,
    };
  }
}

// Singleton instance
export const cacheService = new CacheService();

