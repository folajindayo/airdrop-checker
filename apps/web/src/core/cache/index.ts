/**
 * Caching utilities
 * Provides in-memory caching with TTL support
 * @module core/cache
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface CacheOptions {
  /** Time to live in milliseconds */
  ttl?: number;
  /** Maximum number of entries */
  maxSize?: number;
}

/**
 * Simple in-memory cache with TTL
 */
export class MemoryCache<K = string, V = any> {
  private cache: Map<K, CacheEntry<V>> = new Map();
  private readonly ttl: number;
  private readonly maxSize: number;
  
  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl || 60000; // Default 1 minute
    this.maxSize = options.maxSize || 1000;
  }
  
  /**
   * Get value from cache
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }
  
  /**
   * Set value in cache
   */
  set(key: K, value: V, ttl?: number): void {
    // Enforce max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    const expiresAt = Date.now() + (ttl || this.ttl);
    this.cache.set(key, { value, expiresAt });
  }
  
  /**
   * Check if key exists and is not expired
   */
  has(key: K): boolean {
    return this.get(key) !== undefined;
  }
  
  /**
   * Delete entry from cache
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
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
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }
  
  /**
   * Get or set with async function
   */
  async getOrSet(
    key: K,
    factory: () => Promise<V>,
    ttl?: number
  ): Promise<V> {
    const cached = this.get(key);
    
    if (cached !== undefined) {
      return cached;
    }
    
    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }
}

/**
 * Create memoized function with cache
 */
export function memoize<Args extends any[], Result>(
  fn: (...args: Args) => Result,
  options: {
    keyGenerator?: (...args: Args) => string;
    ttl?: number;
  } = {}
): (...args: Args) => Result {
  const cache = new MemoryCache<string, Result>({ ttl: options.ttl });
  const keyGen = options.keyGenerator || ((...args: Args) => JSON.stringify(args));
  
  return (...args: Args): Result => {
    const key = keyGen(...args);
    const cached = cache.get(key);
    
    if (cached !== undefined) {
      return cached;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Create memoized async function with cache
 */
export function memoizeAsync<Args extends any[], Result>(
  fn: (...args: Args) => Promise<Result>,
  options: {
    keyGenerator?: (...args: Args) => string;
    ttl?: number;
  } = {}
): (...args: Args) => Promise<Result> {
  const cache = new MemoryCache<string, Result>({ ttl: options.ttl });
  const keyGen = options.keyGenerator || ((...args: Args) => JSON.stringify(args));
  
  return async (...args: Args): Promise<Result> => {
    const key = keyGen(...args);
    return cache.getOrSet(key, () => fn(...args));
  };
}

/**
 * LRU Cache implementation
 */
export class LRUCache<K = string, V = any> {
  private cache: Map<K, V> = new Map();
  private readonly maxSize: number;
  
  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }
  
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  set(key: K, value: V): void {
    // Delete if exists to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Evict least recently used if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, value);
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  delete(key: K): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

/**
 * Global memory cache instance
 */
export const globalCache = new MemoryCache();

