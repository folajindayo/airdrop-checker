/**
 * @fileoverview Tests for Redis cache
 */

import {
  RedisCache,
  createRedisCache,
  getRedisClient,
  closeAllRedisClients,
} from '@/lib/cache/redis-cache';

// Mock Redis client
const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  keys: jest.fn(),
  flushdb: jest.fn(),
  mget: jest.fn(),
  mset: jest.fn(),
  incr: jest.fn(),
  decr: jest.fn(),
  hget: jest.fn(),
  hset: jest.fn(),
  hdel: jest.fn(),
  hgetall: jest.fn(),
  sadd: jest.fn(),
  smembers: jest.fn(),
  srem: jest.fn(),
  zadd: jest.fn(),
  zrange: jest.fn(),
  zrem: jest.fn(),
  quit: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('redis', () => ({
  createClient: jest.fn(() => mockRedis),
}));

describe('Redis Cache', () => {
  let cache: RedisCache;

  beforeEach(() => {
    cache = createRedisCache({
      host: 'localhost',
      port: 6379,
      db: 0,
    });

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cache.disconnect();
  });

  describe('Basic Operations', () => {
    it('should set a value', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await cache.set('test-key', 'test-value');

      expect(mockRedis.set).toHaveBeenCalledWith(
        'test-key',
        expect.any(String)
      );
    });

    it('should get a value', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify('test-value'));

      const value = await cache.get('test-key');

      expect(value).toBe('test-value');
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
    });

    it('should delete a value', async () => {
      mockRedis.del.mockResolvedValue(1);

      await cache.delete('test-key');

      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
    });

    it('should check if key exists', async () => {
      mockRedis.exists.mockResolvedValue(1);

      const exists = await cache.exists('test-key');

      expect(exists).toBe(true);
      expect(mockRedis.exists).toHaveBeenCalledWith('test-key');
    });

    it('should return false for non-existent keys', async () => {
      mockRedis.exists.mockResolvedValue(0);

      const exists = await cache.exists('non-existent');

      expect(exists).toBe(false);
    });
  });

  describe('TTL Operations', () => {
    it('should set value with TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await cache.set('test-key', 'test-value', 3600);

      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should get TTL for key', async () => {
      mockRedis.ttl.mockResolvedValue(3600);

      const ttl = await cache.getTTL('test-key');

      expect(ttl).toBe(3600);
      expect(mockRedis.ttl).toHaveBeenCalledWith('test-key');
    });

    it('should set expiration', async () => {
      mockRedis.expire.mockResolvedValue(1);

      await cache.expire('test-key', 3600);

      expect(mockRedis.expire).toHaveBeenCalledWith('test-key', 3600);
    });

    it('should return -1 for keys with no expiration', async () => {
      mockRedis.ttl.mockResolvedValue(-1);

      const ttl = await cache.getTTL('test-key');

      expect(ttl).toBe(-1);
    });

    it('should return -2 for non-existent keys', async () => {
      mockRedis.ttl.mockResolvedValue(-2);

      const ttl = await cache.getTTL('non-existent');

      expect(ttl).toBe(-2);
    });
  });

  describe('Object Operations', () => {
    it('should store and retrieve objects', async () => {
      const obj = { name: 'test', value: 123 };
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue(JSON.stringify(obj));

      await cache.set('obj-key', obj);
      const retrieved = await cache.get('obj-key');

      expect(retrieved).toEqual(obj);
    });

    it('should handle arrays', async () => {
      const arr = [1, 2, 3, 4, 5];
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue(JSON.stringify(arr));

      await cache.set('arr-key', arr);
      const retrieved = await cache.get('arr-key');

      expect(retrieved).toEqual(arr);
    });

    it('should handle nested objects', async () => {
      const nested = {
        user: { id: 1, name: 'test' },
        meta: { timestamp: Date.now() },
      };
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue(JSON.stringify(nested));

      await cache.set('nested-key', nested);
      const retrieved = await cache.get('nested-key');

      expect(retrieved).toEqual(nested);
    });
  });

  describe('Batch Operations', () => {
    it('should get multiple values', async () => {
      mockRedis.mget.mockResolvedValue([
        JSON.stringify('value1'),
        JSON.stringify('value2'),
      ]);

      const values = await cache.mget(['key1', 'key2']);

      expect(values).toEqual(['value1', 'value2']);
      expect(mockRedis.mget).toHaveBeenCalledWith(['key1', 'key2']);
    });

    it('should set multiple values', async () => {
      mockRedis.mset.mockResolvedValue('OK');

      await cache.mset({
        key1: 'value1',
        key2: 'value2',
      });

      expect(mockRedis.mset).toHaveBeenCalled();
    });

    it('should handle null values in mget', async () => {
      mockRedis.mget.mockResolvedValue([JSON.stringify('value1'), null]);

      const values = await cache.mget(['key1', 'key2']);

      expect(values).toEqual(['value1', null]);
    });
  });

  describe('Counter Operations', () => {
    it('should increment counter', async () => {
      mockRedis.incr.mockResolvedValue(1);

      const value = await cache.increment('counter');

      expect(value).toBe(1);
      expect(mockRedis.incr).toHaveBeenCalledWith('counter');
    });

    it('should decrement counter', async () => {
      mockRedis.decr.mockResolvedValue(0);

      const value = await cache.decrement('counter');

      expect(value).toBe(0);
      expect(mockRedis.decr).toHaveBeenCalledWith('counter');
    });

    it('should increment by custom amount', async () => {
      mockRedis.incr.mockResolvedValue(5);

      const value = await cache.increment('counter', 5);

      expect(value).toBe(5);
    });
  });

  describe('Hash Operations', () => {
    it('should set hash field', async () => {
      mockRedis.hset.mockResolvedValue(1);

      await cache.hset('hash-key', 'field', 'value');

      expect(mockRedis.hset).toHaveBeenCalledWith(
        'hash-key',
        'field',
        expect.any(String)
      );
    });

    it('should get hash field', async () => {
      mockRedis.hget.mockResolvedValue(JSON.stringify('value'));

      const value = await cache.hget('hash-key', 'field');

      expect(value).toBe('value');
      expect(mockRedis.hget).toHaveBeenCalledWith('hash-key', 'field');
    });

    it('should delete hash field', async () => {
      mockRedis.hdel.mockResolvedValue(1);

      await cache.hdel('hash-key', 'field');

      expect(mockRedis.hdel).toHaveBeenCalledWith('hash-key', 'field');
    });

    it('should get all hash fields', async () => {
      mockRedis.hgetall.mockResolvedValue({
        field1: JSON.stringify('value1'),
        field2: JSON.stringify('value2'),
      });

      const values = await cache.hgetall('hash-key');

      expect(values).toEqual({
        field1: 'value1',
        field2: 'value2',
      });
    });
  });

  describe('Set Operations', () => {
    it('should add to set', async () => {
      mockRedis.sadd.mockResolvedValue(1);

      await cache.sadd('set-key', 'member');

      expect(mockRedis.sadd).toHaveBeenCalledWith('set-key', 'member');
    });

    it('should get set members', async () => {
      mockRedis.smembers.mockResolvedValue(['member1', 'member2']);

      const members = await cache.smembers('set-key');

      expect(members).toEqual(['member1', 'member2']);
    });

    it('should remove from set', async () => {
      mockRedis.srem.mockResolvedValue(1);

      await cache.srem('set-key', 'member');

      expect(mockRedis.srem).toHaveBeenCalledWith('set-key', 'member');
    });
  });

  describe('Sorted Set Operations', () => {
    it('should add to sorted set', async () => {
      mockRedis.zadd.mockResolvedValue(1);

      await cache.zadd('zset-key', 1, 'member');

      expect(mockRedis.zadd).toHaveBeenCalledWith('zset-key', 1, 'member');
    });

    it('should get sorted set range', async () => {
      mockRedis.zrange.mockResolvedValue(['member1', 'member2']);

      const members = await cache.zrange('zset-key', 0, -1);

      expect(members).toEqual(['member1', 'member2']);
    });

    it('should remove from sorted set', async () => {
      mockRedis.zrem.mockResolvedValue(1);

      await cache.zrem('zset-key', 'member');

      expect(mockRedis.zrem).toHaveBeenCalledWith('zset-key', 'member');
    });
  });

  describe('Key Pattern Operations', () => {
    it('should get keys by pattern', async () => {
      mockRedis.keys.mockResolvedValue(['key1', 'key2', 'key3']);

      const keys = await cache.keys('key*');

      expect(keys).toEqual(['key1', 'key2', 'key3']);
      expect(mockRedis.keys).toHaveBeenCalledWith('key*');
    });

    it('should flush database', async () => {
      mockRedis.flushdb.mockResolvedValue('OK');

      await cache.flush();

      expect(mockRedis.flushdb).toHaveBeenCalled();
    });
  });

  describe('Connection Management', () => {
    it('should disconnect', async () => {
      mockRedis.quit.mockResolvedValue('OK');

      await cache.disconnect();

      expect(mockRedis.quit).toHaveBeenCalled();
    });

    it('should handle disconnect errors', async () => {
      mockRedis.quit.mockRejectedValue(new Error('Disconnect failed'));

      await expect(cache.disconnect()).rejects.toThrow();
    });
  });

  describe('Global Client Management', () => {
    afterEach(async () => {
      await closeAllRedisClients();
    });

    it('should get named client', () => {
      const client1 = getRedisClient('default');
      const client2 = getRedisClient('default');

      expect(client1).toBe(client2);
    });

    it('should create different clients for different names', () => {
      const client1 = getRedisClient('cache1');
      const client2 = getRedisClient('cache2');

      expect(client1).not.toBe(client2);
    });

    it('should close all clients', async () => {
      getRedisClient('cache1');
      getRedisClient('cache2');

      await expect(closeAllRedisClients()).resolves.toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle get errors', async () => {
      mockRedis.get.mockRejectedValue(new Error('Get failed'));

      await expect(cache.get('test-key')).rejects.toThrow();
    });

    it('should handle set errors', async () => {
      mockRedis.set.mockRejectedValue(new Error('Set failed'));

      await expect(cache.set('test-key', 'value')).rejects.toThrow();
    });

    it('should handle delete errors', async () => {
      mockRedis.del.mockRejectedValue(new Error('Delete failed'));

      await expect(cache.delete('test-key')).rejects.toThrow();
    });

    it('should handle JSON parse errors', async () => {
      mockRedis.get.mockResolvedValue('invalid-json');

      await expect(cache.get('test-key')).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle rapid operations', async () => {
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue(JSON.stringify('value'));

      const operations = Array(100)
        .fill(null)
        .map((_, i) => cache.set(`key-${i}`, `value-${i}`));

      await expect(Promise.all(operations)).resolves.toBeDefined();
    });

    it('should handle large values', async () => {
      const largeValue = 'x'.repeat(1000000);
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue(JSON.stringify(largeValue));

      await cache.set('large-key', largeValue);
      const retrieved = await cache.get('large-key');

      expect(retrieved).toBe(largeValue);
    });
  });
});

