/**
 * @fileoverview Tests for MemoryCache
 */

import { MemoryCache } from '@/lib/cache/memory-cache';

describe('MemoryCache', () => {
  let cache: MemoryCache<any>;

  beforeEach(() => {
    cache = new MemoryCache({
      defaultTTL: 1000,
      maxItems: 5,
      maxSize: 1024,
      enableLRU: true,
      enableStats: true,
    });
  });

  describe('Basic Operations', () => {
    it('should set and get value', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for non-existent key', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should delete value', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should return false when deleting non-existent key', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });

    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should clear all values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.size()).toBe(0);
    });

    it('should get cache size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
    });

    it('should get all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      const keys = cache.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire item after TTL', async () => {
      cache.set('key1', 'value1', 100);
      expect(cache.get('key1')).toBe('value1');
      
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should use default TTL when not specified', async () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
      
      // Should still exist after 500ms (default is 1000ms)
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(cache.get('key1')).toBe('value1');
    });

    it('should get remaining TTL', () => {
      cache.set('key1', 'value1', 1000);
      const ttl = cache.ttl('key1');
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(1000);
    });

    it('should return -1 for expired item TTL', async () => {
      cache.set('key1', 'value1', 100);
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(cache.ttl('key1')).toBe(-1);
    });

    it('should extend TTL for existing item', async () => {
      cache.set('key1', 'value1', 200);
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      cache.extend('key1', 500);
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      expect(cache.get('key1')).toBe('value1');
    });

    it('should not extend TTL for expired item', async () => {
      cache.set('key1', 'value1', 100);
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      expect(cache.extend('key1', 500)).toBe(false);
    });
  });

  describe('LRU Eviction', () => {
    it('should evict least recently used item when max items reached', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4');
      cache.set('key5', 'value5');
      
      // Access key1 to make it recently used
      cache.get('key1');
      
      // Adding key6 should evict key2 (least recently used)
      cache.set('key6', 'value6');
      
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key6')).toBe(true);
    });

    it('should evict oldest item when LRU disabled', () => {
      const noLRUCache = new MemoryCache({
        maxItems: 3,
        enableLRU: false,
      });

      noLRUCache.set('key1', 'value1');
      noLRUCache.set('key2', 'value2');
      noLRUCache.set('key3', 'value3');
      noLRUCache.set('key4', 'value4');

      // key1 should be evicted (oldest)
      expect(noLRUCache.has('key1')).toBe(false);
      expect(noLRUCache.has('key4')).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should track hits and misses', () => {
      cache.set('key1', 'value1');
      
      cache.get('key1'); // hit
      cache.get('nonexistent'); // miss
      cache.get('key1'); // hit
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
    });

    it('should calculate hit rate', () => {
      cache.set('key1', 'value1');
      
      cache.get('key1'); // hit
      cache.get('nonexistent'); // miss
      cache.get('key1'); // hit
      cache.get('nonexistent'); // miss
      
      const stats = cache.getStats();
      expect(stats.hitRate).toBe(50);
    });

    it('should track total size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const stats = cache.getStats();
      expect(stats.totalSize).toBeGreaterThan(0);
    });

    it('should calculate average item size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const stats = cache.getStats();
      expect(stats.avgSize).toBeGreaterThan(0);
    });

    it('should reset stats on clear', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.clear();
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('Batch Operations', () => {
    it('should get multiple items', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      const result = cache.getMany(['key1', 'key2', 'nonexistent']);
      expect(result.get('key1')).toBe('value1');
      expect(result.get('key2')).toBe('value2');
      expect(result.has('nonexistent')).toBe(false);
    });

    it('should set multiple items', () => {
      const items = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
        ['key3', 'value3'],
      ]);
      
      cache.setMany(items);
      
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });

    it('should delete multiple items', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      const count = cache.deleteMany(['key1', 'key3']);
      
      expect(count).toBe(2);
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(false);
    });
  });

  describe('Pattern Operations', () => {
    it('should delete items matching pattern', () => {
      cache.set('user:1', 'value1');
      cache.set('user:2', 'value2');
      cache.set('post:1', 'value3');
      
      const count = cache.deletePattern(/^user:/);
      
      expect(count).toBe(2);
      expect(cache.has('user:1')).toBe(false);
      expect(cache.has('user:2')).toBe(false);
      expect(cache.has('post:1')).toBe(true);
    });

    it('should get items matching pattern', () => {
      cache.set('user:1', 'value1');
      cache.set('user:2', 'value2');
      cache.set('post:1', 'value3');
      
      const result = cache.getPattern(/^user:/);
      
      expect(result.size).toBe(2);
      expect(result.get('user:1')).toBe('value1');
      expect(result.get('user:2')).toBe('value2');
      expect(result.has('post:1')).toBe(false);
    });
  });

  describe('Get or Set', () => {
    it('should return cached value if exists', async () => {
      cache.set('key1', 'cached-value');
      
      const fetcher = jest.fn().mockResolvedValue('fetched-value');
      const result = await cache.getOrSet('key1', fetcher);
      
      expect(result).toBe('cached-value');
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should fetch and cache value if not exists', async () => {
      const fetcher = jest.fn().mockResolvedValue('fetched-value');
      const result = await cache.getOrSet('key1', fetcher);
      
      expect(result).toBe('fetched-value');
      expect(fetcher).toHaveBeenCalled();
      expect(cache.get('key1')).toBe('fetched-value');
    });

    it('should use custom TTL for fetched value', async () => {
      const fetcher = jest.fn().mockResolvedValue('fetched-value');
      await cache.getOrSet('key1', fetcher, 100);
      
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(cache.get('key1')).toBeUndefined();
    });
  });

  describe('Pruning', () => {
    it('should prune expired items', async () => {
      cache.set('key1', 'value1', 100);
      cache.set('key2', 'value2', 1000);
      
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      const pruned = cache.prune();
      expect(pruned).toBe(1);
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle complex objects', () => {
      const obj = { name: 'John', age: 30, hobbies: ['reading', 'coding'] };
      cache.set('user', obj);
      expect(cache.get('user')).toEqual(obj);
    });

    it('should handle null values', () => {
      cache.set('key', null);
      expect(cache.get('key')).toBeNull();
    });

    it('should handle undefined values', () => {
      cache.set('key', undefined);
      // undefined is a valid value but returns undefined when getting
      expect(cache.get('key')).toBeUndefined();
    });

    it('should handle arrays', () => {
      const arr = [1, 2, 3, 4, 5];
      cache.set('numbers', arr);
      expect(cache.get('numbers')).toEqual(arr);
    });

    it('should handle large values', () => {
      const largeValue = 'x'.repeat(10000);
      cache.set('large', largeValue);
      expect(cache.get('large')).toBe(largeValue);
    });

    it('should handle many items', () => {
      const largeCache = new MemoryCache({ maxItems: 1000 });
      
      for (let i = 0; i < 500; i++) {
        largeCache.set(`key${i}`, `value${i}`);
      }
      
      expect(largeCache.size()).toBe(500);
    });
  });

  describe('Memory Management', () => {
    it('should evict items when size limit exceeded', () => {
      const smallCache = new MemoryCache({
        maxSize: 100,
        enableLRU: true,
      });

      // Add items that will exceed size limit
      smallCache.set('key1', 'x'.repeat(50));
      smallCache.set('key2', 'y'.repeat(50));
      smallCache.set('key3', 'z'.repeat(50));

      // Cache should have evicted some items to stay under limit
      expect(smallCache.size()).toBeLessThan(3);
    });
  });
});

