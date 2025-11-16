/**
 * Cache Service Tests
 */

import { CacheService } from '../../../src/services/cache-service';

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService();
  });

  afterEach(async () => {
    await cache.clear();
  });

  describe('get and set', () => {
    it('should store and retrieve values', async () => {
      await cache.set('key', 'value');
      const result = await cache.get('key');
      expect(result).toBe('value');
    });

    it('should return null for missing keys', async () => {
      const result = await cache.get('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('TTL', () => {
    it('should expire entries after TTL', async () => {
      await cache.set('key', 'value', { ttl: 100 });
      await new Promise(resolve => setTimeout(resolve, 150));
      const result = await cache.get('key');
      expect(result).toBeNull();
    });
  });

  describe('getOrSet', () => {
    it('should use cached value if available', async () => {
      const factory = jest.fn().mockResolvedValue('value');
      await cache.set('key', 'cached');
      const result = await cache.getOrSet('key', factory);
      expect(result).toBe('cached');
      expect(factory).not.toHaveBeenCalled();
    });

    it('should call factory if not cached', async () => {
      const factory = jest.fn().mockResolvedValue('value');
      const result = await cache.getOrSet('key', factory);
      expect(result).toBe('value');
      expect(factory).toHaveBeenCalled();
    });
  });
});

