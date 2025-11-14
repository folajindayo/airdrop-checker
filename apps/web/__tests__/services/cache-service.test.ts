/**
 * Tests for CacheService
 */

import { CacheService } from '@/lib/services/cache-service';

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService();
  });

  describe('basic operations', () => {
    it('should set and get values', () => {
      cache.set('key1', 'value1', 1000);
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should delete values', () => {
      cache.set('key1', 'value1', 1000);
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should check if key exists', () => {
      cache.set('key1', 'value1', 1000);
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should clear all entries', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1000);
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe('expiration', () => {
    it('should expire entries after TTL', async () => {
      cache.set('key1', 'value1', 50);
      expect(cache.get('key1')).toBe('value1');

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should not return expired entries', async () => {
      cache.set('key1', 'value1', 50);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(cache.has('key1')).toBe(false);
    });

    it('should clear expired entries', async () => {
      cache.set('key1', 'value1', 50);
      cache.set('key2', 'value2', 1000);

      await new Promise((resolve) => setTimeout(resolve, 100));
      cache.clearExpired();

      expect(cache.size()).toBe(1);
      expect(cache.get('key2')).toBe('value2');
    });

    it('should get TTL remaining', () => {
      cache.set('key1', 'value1', 1000);
      const ttl = cache.getTTL('key1');
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(1000);
    });

    it('should return -1 for non-existent key TTL', () => {
      expect(cache.getTTL('nonexistent')).toBe(-1);
    });

    it('should touch (refresh) TTL', async () => {
      cache.set('key1', 'value1', 100);
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      cache.touch('key1', 1000);
      const ttl = cache.getTTL('key1');
      expect(ttl).toBeGreaterThan(900);
    });
  });

  describe('statistics', () => {
    it('should track hits and misses', () => {
      cache.set('key1', 'value1', 1000);
      
      cache.get('key1'); // hit
      cache.get('key2'); // miss
      cache.get('key1'); // hit

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.666, 2);
    });

    it('should track sets and deletes', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1000);
      cache.delete('key1');

      const stats = cache.getStats();
      expect(stats.sets).toBe(2);
      expect(stats.deletes).toBe(1);
    });

    it('should track cache size', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1000);

      const stats = cache.getStats();
      expect(stats.size).toBe(2);
    });

    it('should reset statistics', () => {
      cache.set('key1', 'value1', 1000);
      cache.get('key1');
      cache.resetStats();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.sets).toBe(0);
    });
  });

  describe('batch operations', () => {
    it('should get multiple values', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1000);
      cache.set('key3', 'value3', 1000);

      const results = cache.getMany(['key1', 'key2', 'key4']);
      expect(results.get('key1')).toBe('value1');
      expect(results.get('key2')).toBe('value2');
      expect(results.has('key4')).toBe(false);
    });

    it('should set multiple values', () => {
      const entries = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]);

      cache.setMany(entries, 1000);
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
    });
  });

  describe('pattern deletion', () => {
    it('should delete keys matching pattern', () => {
      cache.set('user:1', 'data1', 1000);
      cache.set('user:2', 'data2', 1000);
      cache.set('post:1', 'data3', 1000);

      const deleted = cache.deletePattern(/^user:/);
      expect(deleted).toBe(2);
      expect(cache.get('user:1')).toBeUndefined();
      expect(cache.get('post:1')).toBe('data3');
    });
  });

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      cache.set('key1', 'cached', 1000);
      
      const fetcher = jest.fn(async () => 'fetched');
      const result = await cache.getOrSet('key1', fetcher, 1000);

      expect(result).toBe('cached');
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should fetch and cache if not exists', async () => {
      const fetcher = jest.fn(async () => 'fetched');
      const result = await cache.getOrSet('key1', fetcher, 1000);

      expect(result).toBe('fetched');
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(cache.get('key1')).toBe('fetched');
    });
  });

  describe('wrap function', () => {
    it('should cache function results', async () => {
      let callCount = 0;
      const fn = async (x: number) => {
        callCount++;
        return x * 2;
      };

      const wrapped = cache.wrap(
        fn,
        (x) => `multiply:${x}`,
        1000
      );

      expect(await wrapped(5)).toBe(10);
      expect(await wrapped(5)).toBe(10);
      expect(callCount).toBe(1);
    });

    it('should cache different arguments separately', async () => {
      const fn = async (x: number) => x * 2;
      const wrapped = cache.wrap(fn, (x) => `multiply:${x}`, 1000);

      expect(await wrapped(5)).toBe(10);
      expect(await wrapped(10)).toBe(20);
      expect(cache.size()).toBe(2);
    });
  });

  describe('keys and size', () => {
    it('should return all keys', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1000);

      const keys = cache.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toHaveLength(2);
    });

    it('should return cache size', () => {
      expect(cache.size()).toBe(0);
      cache.set('key1', 'value1', 1000);
      expect(cache.size()).toBe(1);
      cache.set('key2', 'value2', 1000);
      expect(cache.size()).toBe(2);
    });
  });

  describe('complex data types', () => {
    it('should cache objects', () => {
      const obj = { name: 'test', value: 123 };
      cache.set('obj', obj, 1000);
      expect(cache.get('obj')).toEqual(obj);
    });

    it('should cache arrays', () => {
      const arr = [1, 2, 3, 4, 5];
      cache.set('arr', arr, 1000);
      expect(cache.get('arr')).toEqual(arr);
    });

    it('should cache nested structures', () => {
      const data = {
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
        meta: { count: 2 },
      };
      cache.set('data', data, 1000);
      expect(cache.get('data')).toEqual(data);
    });
  });
});

