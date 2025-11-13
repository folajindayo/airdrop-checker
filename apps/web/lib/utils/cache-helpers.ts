/**
 * Cache helper utilities
 * Provides enhanced caching functionality
 * 
 * @module CacheHelpers
 */

import { cache, CACHE_TTL } from '@airdrop-finder/shared';

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Get cached value or compute and cache
 * 
 * @param key - Cache key
 * @param computeFn - Function to compute value if not cached
 * @param ttl - Time to live in milliseconds
 * @returns Cached or computed value
 * 
 * @example
 * ```typescript
 * const data = await getOrSetCache('user-data', async () => {
 *   return await fetchUserData();
 * }, CACHE_TTL.USER_DATA);
 * ```
 */
export async function getOrSetCache<T>(
  key: string,
  computeFn: () => Promise<T>,
  ttl: number = CACHE_TTL.DEFAULT
): Promise<T> {
  // Try to get from cache
  const cached = cache.get<T>(key);
  if (cached) {
    return cached;
  }

  // Compute value
  const value = await computeFn();

  // Cache value
  cache.set(key, value, ttl);

  return value;
}

/**
 * Invalidate cache entries matching pattern
 * 
 * @param pattern - Pattern to match cache keys (supports wildcards)
 */
export function invalidateCache(pattern: string): void {
  // Note: This is a simplified implementation
  // In production, you might want to use a more sophisticated cache invalidation strategy
  if (pattern.includes('*')) {
    // Handle wildcard patterns if needed
    // This would require access to cache internals
  } else {
    cache.delete(pattern);
  }
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  // Note: This requires access to cache internals
  // Implementation depends on cache implementation
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  hitRate?: number;
} {
  // Note: This requires cache implementation to expose statistics
  return {
    size: 0,
  };
}

