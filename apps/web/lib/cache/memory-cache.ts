/**
 * @fileoverview In-memory cache implementation
 * 
 * Advanced in-memory caching system with TTL, LRU eviction, and statistics
 */

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  /** Cached value */
  value: T;
  /** Expiration timestamp */
  expiresAt: number;
  /** Last access timestamp */
  lastAccessedAt: number;
  /** Number of accesses */
  accessCount: number;
  /** Size in bytes (estimated) */
  size: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Total number of items */
  itemCount: number;
  /** Total hits */
  hits: number;
  /** Total misses */
  misses: number;
  /** Hit rate percentage */
  hitRate: number;
  /** Total size in bytes */
  totalSize: number;
  /** Average item size */
  avgSize: number;
}

/**
 * Cache options
 */
export interface CacheOptions {
  /** Default TTL in milliseconds */
  defaultTTL?: number;
  /** Maximum number of items */
  maxItems?: number;
  /** Maximum cache size in bytes */
  maxSize?: number;
  /** Enable LRU eviction */
  enableLRU?: boolean;
  /** Enable statistics */
  enableStats?: boolean;
}

/**
 * Memory cache class
 */
export class MemoryCache<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private options: Required<CacheOptions>;
  private stats: { hits: number; misses: number };

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.options = {
      defaultTTL: options.defaultTTL || 300000, // 5 minutes
      maxItems: options.maxItems || 1000,
      maxSize: options.maxSize || 10 * 1024 * 1024, // 10 MB
      enableLRU: options.enableLRU !== false,
      enableStats: options.enableStats !== false,
    };
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Estimate size of value in bytes
   */
  private estimateSize(value: T): number {
    const str = JSON.stringify(value);
    return str.length * 2; // UTF-16 uses 2 bytes per character
  }

  /**
   * Check if item is expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Evict expired items
   */
  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    if (this.cache.size === 0) return;

    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessedAt < oldestTime) {
        oldestTime = entry.lastAccessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Ensure cache doesn't exceed limits
   */
  private enforceLimit(): void {
    // Evict expired items first
    this.evictExpired();

    // Check item count limit
    if (this.cache.size >= this.options.maxItems) {
      if (this.options.enableLRU) {
        this.evictLRU();
      } else {
        // Evict oldest item
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
          this.cache.delete(firstKey);
        }
      }
    }

    // Check size limit
    const totalSize = this.getTotalSize();
    if (totalSize > this.options.maxSize) {
      if (this.options.enableLRU) {
        // Evict LRU items until under limit
        while (this.getTotalSize() > this.options.maxSize && this.cache.size > 0) {
          this.evictLRU();
        }
      } else {
        // Evict oldest items
        while (this.getTotalSize() > this.options.maxSize && this.cache.size > 0) {
          const firstKey = this.cache.keys().next().value;
          if (firstKey) {
            this.cache.delete(firstKey);
          }
        }
      }
    }
  }

  /**
   * Get total cache size
   */
  private getTotalSize(): number {
    let total = 0;
    for (const entry of this.cache.values()) {
      total += entry.size;
    }
    return total;
  }

  /**
   * Set cache item
   */
  set(key: string, value: T, ttl?: number): void {
    const size = this.estimateSize(value);
    const expiresAt = Date.now() + (ttl || this.options.defaultTTL);

    this.cache.set(key, {
      value,
      expiresAt,
      lastAccessedAt: Date.now(),
      accessCount: 0,
      size,
    });

    this.enforceLimit();
  }

  /**
   * Get cache item
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      if (this.options.enableStats) {
        this.stats.misses++;
      }
      return undefined;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      if (this.options.enableStats) {
        this.stats.misses++;
      }
      return undefined;
    }

    // Update access info
    entry.lastAccessedAt = Date.now();
    entry.accessCount++;

    if (this.options.enableStats) {
      this.stats.hits++;
    }

    return entry.value;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cache item
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache items
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    this.evictExpired();
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    this.evictExpired();
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.evictExpired();

    const items = Array.from(this.cache.values());
    const totalSize = items.reduce((sum, entry) => sum + entry.size, 0);
    const avgSize = items.length > 0 ? totalSize / items.length : 0;
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    return {
      itemCount: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      totalSize,
      avgSize,
    };
  }

  /**
   * Get or set (fetch if not cached)
   */
  async getOrSet(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetcher();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Get multiple items
   */
  getMany(keys: string[]): Map<string, T> {
    const result = new Map<string, T>();
    
    for (const key of keys) {
      const value = this.get(key);
      if (value !== undefined) {
        result.set(key, value);
      }
    }

    return result;
  }

  /**
   * Set multiple items
   */
  setMany(items: Map<string, T>, ttl?: number): void {
    for (const [key, value] of items.entries()) {
      this.set(key, value, ttl);
    }
  }

  /**
   * Delete multiple items
   */
  deleteMany(keys: string[]): number {
    let count = 0;
    for (const key of keys) {
      if (this.delete(key)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Delete items matching pattern
   */
  deletePattern(pattern: RegExp): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Get items matching pattern
   */
  getPattern(pattern: RegExp): Map<string, T> {
    const result = new Map<string, T>();
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        const value = this.get(key);
        if (value !== undefined) {
          result.set(key, value);
        }
      }
    }

    return result;
  }

  /**
   * Extend TTL for existing item
   */
  extend(key: string, additionalTTL: number): boolean {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      return false;
    }

    entry.expiresAt += additionalTTL;
    return true;
  }

  /**
   * Get remaining TTL
   */
  ttl(key: string): number {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      return -1;
    }

    return Math.max(0, entry.expiresAt - Date.now());
  }

  /**
   * Prune expired items (manual cleanup)
   */
  prune(): number {
    const initialSize = this.cache.size;
    this.evictExpired();
    return initialSize - this.cache.size;
  }
}

/**
 * Create a singleton cache instance
 */
export const globalCache = new MemoryCache({
  defaultTTL: 300000, // 5 minutes
  maxItems: 1000,
  maxSize: 10 * 1024 * 1024, // 10 MB
  enableLRU: true,
  enableStats: true,
});

/**
 * Example usage:
 * 
 * const cache = new MemoryCache({ defaultTTL: 60000 });
 * 
 * // Set value
 * cache.set('user:123', { name: 'John' });
 * 
 * // Get value
 * const user = cache.get('user:123');
 * 
 * // Get or fetch
 * const data = await cache.getOrSet('key', async () => {
 *   return await fetchData();
 * });
 * 
 * // Get stats
 * const stats = cache.getStats();
 * console.log(`Hit rate: ${stats.hitRate}%`);
 */

