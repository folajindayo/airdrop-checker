/**
 * Cache Service
 * Advanced caching layer with TTL, invalidation, and statistics
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
  hitRate: number;
}

export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  /**
   * Get value from cache
   *
   * @param key - Cache key
   * @returns Cached value or undefined
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return undefined;
    }

    entry.hits++;
    this.stats.hits++;
    return entry.value as T;
  }

  /**
   * Set value in cache
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds
   */
  set<T>(key: string, value: T, ttl: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
      hits: 0,
    });
    this.stats.sets++;
  }

  /**
   * Delete value from cache
   *
   * @param key - Cache key
   * @returns True if deleted
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) this.stats.deletes++;
    return deleted;
  }

  /**
   * Check if key exists in cache
   *
   * @param key - Cache key
   * @returns True if exists and not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const size = this.cache.size;
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    return {
      ...this.stats,
      size,
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
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get or set value (fetch if not exists)
   *
   * @param key - Cache key
   * @param fetcher - Function to fetch value if not cached
   * @param ttl - Time to live in milliseconds
   * @returns Cached or fetched value
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetcher();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Delete keys matching a pattern
   *
   * @param pattern - RegExp pattern to match keys
   * @returns Number of deleted keys
   */
  deletePattern(pattern: RegExp): number {
    let deleted = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    this.stats.deletes += deleted;
    return deleted;
  }

  /**
   * Get multiple values
   *
   * @param keys - Array of cache keys
   * @returns Map of key-value pairs
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
   * Set multiple values
   *
   * @param entries - Map of key-value pairs
   * @param ttl - Time to live in milliseconds
   */
  setMany<T>(entries: Map<string, T>, ttl: number): void {
    for (const [key, value] of entries.entries()) {
      this.set(key, value, ttl);
    }
  }

  /**
   * Touch (refresh TTL) a cache entry
   *
   * @param key - Cache key
   * @param ttl - New time to live in milliseconds
   * @returns True if key exists and was touched
   */
  touch(key: string, ttl: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    entry.expiresAt = Date.now() + ttl;
    return true;
  }

  /**
   * Get TTL remaining for a key
   *
   * @param key - Cache key
   * @returns Milliseconds until expiration, or -1 if not found
   */
  getTTL(key: string): number {
    const entry = this.cache.get(key);
    if (!entry) return -1;

    const remaining = entry.expiresAt - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Wrap a function with caching
   *
   * @param fn - Function to wrap
   * @param keyFn - Function to generate cache key from arguments
   * @param ttl - Time to live in milliseconds
   * @returns Wrapped function
   */
  wrap<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    keyFn: (...args: TArgs) => string,
    ttl: number
  ): (...args: TArgs) => Promise<TReturn> {
    return async (...args: TArgs): Promise<TReturn> => {
      const key = keyFn(...args);
      return this.getOrSet(key, () => fn(...args), ttl);
    };
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Background job to clear expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    cacheService.clearExpired();
  }, 5 * 60 * 1000);
}

