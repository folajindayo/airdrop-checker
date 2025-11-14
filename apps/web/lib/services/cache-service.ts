/**
 * CacheService - Advanced in-memory caching with TTL and statistics
 */

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
  hitRate: number;
}

/**
 * Advanced cache service with TTL, statistics, and batch operations
 */
export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    return entry.value as T;
  }

  /**
   * Set a value in cache with TTL
   */
  set<T>(key: string, value: T, ttlMs: number): void {
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { value, expiry });
    this.stats.sets++;
  }

  /**
   * Delete a value from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Clear all entries
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
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get TTL remaining in milliseconds
   */
  getTTL(key: string): number {
    const entry = this.cache.get(key);
    if (!entry) return -1;
    
    const remaining = entry.expiry - Date.now();
    return remaining > 0 ? remaining : -1;
  }

  /**
   * Refresh TTL for a key
   */
  touch(key: string, ttlMs: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    entry.expiry = Date.now() + ttlMs;
    return true;
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    let cleared = 0;
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    return cleared;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;
    
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  /**
   * Get multiple values at once
   */
  getMany<T>(keys: string[]): Map<string, T> {
    const results = new Map<string, T>();
    
    for (const key of keys) {
      const value = this.get<T>(key);
      if (value !== undefined) {
        results.set(key, value);
      }
    }
    
    return results;
  }

  /**
   * Set multiple values at once
   */
  setMany<T>(entries: Map<string, T>, ttlMs: number): void {
    for (const [key, value] of entries.entries()) {
      this.set(key, value, ttlMs);
    }
  }

  /**
   * Delete keys matching a pattern
   */
  deletePattern(pattern: RegExp): number {
    let deleted = 0;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        deleted++;
        this.stats.deletes++;
      }
    }
    
    return deleted;
  }

  /**
   * Get or set value (lazy loading pattern)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetcher();
    this.set(key, value, ttlMs);
    return value;
  }

  /**
   * Wrap a function with caching
   */
  wrap<Args extends any[], Result>(
    fn: (...args: Args) => Promise<Result>,
    keyGenerator: (...args: Args) => string,
    ttlMs: number
  ) {
    return async (...args: Args): Promise<Result> => {
      const key = keyGenerator(...args);
      return this.getOrSet(key, () => fn(...args), ttlMs);
    };
  }
}

// Export singleton instance
export const cacheService = new CacheService();
