/**
 * In-memory cache implementation with TTL support
 */

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

export class MemoryCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 300000) {
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl ?? this.defaultTTL);
    this.cache.set(key, { value, expiry });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  keys(): string[] {
    this.cleanup();
    return Array.from(this.cache.keys());
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  getOrSet(key: string, factory: () => T, ttl?: number): T {
    const existing = this.get(key);
    if (existing !== null) {
      return existing;
    }

    const value = factory();
    this.set(key, value, ttl);
    return value;
  }

  async getOrSetAsync(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const existing = this.get(key);
    if (existing !== null) {
      return existing;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }
}

export const cache = new MemoryCache();

export function withCache<T>(
  key: string,
  factory: () => T,
  ttl?: number
): T {
  return cache.getOrSet(key, factory, ttl);
}

export async function withCacheAsync<T>(
  key: string,
  factory: () => Promise<T>,
  ttl?: number
): Promise<T> {
  return cache.getOrSetAsync(key, factory, ttl);
}

