/**
 * @fileoverview Redis cache implementation with connection pooling
 * @module lib/cache/redis-cache
 */

import { logger } from '@/lib/monitoring/logger';

/**
 * Cache entry with metadata
 */
export interface CacheEntry<T = any> {
  /**
   * Cache key
   */
  key: string;

  /**
   * Cached value
   */
  value: T;

  /**
   * Creation timestamp
   */
  createdAt: number;

  /**
   * Expiration timestamp
   */
  expiresAt?: number;

  /**
   * Access count
   */
  hits?: number;
}

/**
 * Cache options
 */
export interface CacheOptions {
  /**
   * Time to live in seconds
   */
  ttl?: number;

  /**
   * Enable cache compression
   */
  compress?: boolean;

  /**
   * Cache tags for bulk invalidation
   */
  tags?: string[];

  /**
   * Enable cache metrics tracking
   */
  trackMetrics?: boolean;
}

/**
 * Redis cache configuration
 */
export interface RedisCacheConfig {
  /**
   * Redis host
   */
  host?: string;

  /**
   * Redis port
   */
  port?: number;

  /**
   * Redis password
   */
  password?: string;

  /**
   * Redis database number
   */
  db?: number;

  /**
   * Key prefix for all cache keys
   */
  keyPrefix?: string;

  /**
   * Default TTL in seconds
   */
  defaultTTL?: number;

  /**
   * Enable compression
   */
  enableCompression?: boolean;

  /**
   * Connection pool size
   */
  poolSize?: number;

  /**
   * Connection timeout in milliseconds
   */
  connectTimeout?: number;

  /**
   * Enable retry logic
   */
  enableRetry?: boolean;

  /**
   * Max retry attempts
   */
  maxRetries?: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /**
   * Total cache hits
   */
  hits: number;

  /**
   * Total cache misses
   */
  misses: number;

  /**
   * Hit rate percentage
   */
  hitRate: number;

  /**
   * Total keys
   */
  keys: number;

  /**
   * Memory usage in bytes
   */
  memoryUsage: number;

  /**
   * Average get latency in ms
   */
  avgGetLatency: number;

  /**
   * Average set latency in ms
   */
  avgSetLatency: number;
}

/**
 * Redis cache implementation
 * Note: This is a mock implementation. In production, use a real Redis client like 'ioredis'
 */
export class RedisCache {
  private config: Required<RedisCacheConfig>;
  private cache: Map<string, CacheEntry> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    gets: 0,
    sets: 0,
    getLatencies: [] as number[],
    setLatencies: [] as number[],
  };
  private connected = false;

  constructor(config: RedisCacheConfig = {}) {
    this.config = {
      host: config.host || process.env.REDIS_HOST || 'localhost',
      port: config.port || parseInt(process.env.REDIS_PORT || '6379'),
      password: config.password || process.env.REDIS_PASSWORD || '',
      db: config.db || 0,
      keyPrefix: config.keyPrefix || 'cache:',
      defaultTTL: config.defaultTTL || 3600, // 1 hour
      enableCompression: config.enableCompression ?? true,
      poolSize: config.poolSize || 10,
      connectTimeout: config.connectTimeout || 5000,
      enableRetry: config.enableRetry ?? true,
      maxRetries: config.maxRetries || 3,
    };
  }

  /**
   * Connect to Redis
   */
  public async connect(): Promise<void> {
    try {
      // In production, establish real Redis connection here
      this.connected = true;

      logger.info('Redis cache connected', {
        host: this.config.host,
        port: this.config.port,
        db: this.config.db,
      });
    } catch (error) {
      logger.error('Failed to connect to Redis', { error });
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  public async disconnect(): Promise<void> {
    this.connected = false;
    this.cache.clear();

    logger.info('Redis cache disconnected');
  }

  /**
   * Get value from cache
   */
  public async get<T = any>(key: string): Promise<T | null> {
    const startTime = Date.now();

    try {
      const fullKey = this.getFullKey(key);
      const entry = this.cache.get(fullKey);

      if (!entry) {
        this.stats.misses++;
        return null;
      }

      // Check expiration
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        this.cache.delete(fullKey);
        this.stats.misses++;
        return null;
      }

      // Update access count
      if (entry.hits !== undefined) {
        entry.hits++;
      }

      this.stats.hits++;

      const latency = Date.now() - startTime;
      this.stats.getLatencies.push(latency);
      this.stats.gets++;

      logger.debug('Cache hit', { key, latency });

      return entry.value as T;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  public async set<T = any>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const startTime = Date.now();

    try {
      const fullKey = this.getFullKey(key);
      const ttl = options.ttl || this.config.defaultTTL;

      const entry: CacheEntry<T> = {
        key: fullKey,
        value,
        createdAt: Date.now(),
        expiresAt: Date.now() + ttl * 1000,
        hits: 0,
      };

      // In production, implement compression if enabled
      if (options.compress || this.config.enableCompression) {
        // Compress value
      }

      this.cache.set(fullKey, entry);

      // Handle tags
      if (options.tags) {
        for (const tag of options.tags) {
          await this.addToTagSet(tag, fullKey);
        }
      }

      const latency = Date.now() - startTime;
      this.stats.setLatencies.push(latency);
      this.stats.sets++;

      logger.debug('Cache set', { key, ttl, latency });
    } catch (error) {
      logger.error('Cache set error', { key, error });
      throw error;
    }
  }

  /**
   * Delete key from cache
   */
  public async delete(key: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      const existed = this.cache.delete(fullKey);

      logger.debug('Cache delete', { key, existed });

      return existed;
    } catch (error) {
      logger.error('Cache delete error', { key, error });
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  public async deleteMany(keys: string[]): Promise<number> {
    let count = 0;

    for (const key of keys) {
      const deleted = await this.delete(key);
      if (deleted) count++;
    }

    return count;
  }

  /**
   * Check if key exists
   */
  public async exists(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    const entry = this.cache.get(fullKey);

    if (!entry) {
      return false;
    }

    // Check expiration
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(fullKey);
      return false;
    }

    return true;
  }

  /**
   * Get time to live for key
   */
  public async ttl(key: string): Promise<number> {
    const fullKey = this.getFullKey(key);
    const entry = this.cache.get(fullKey);

    if (!entry || !entry.expiresAt) {
      return -1;
    }

    const remaining = Math.max(0, entry.expiresAt - Date.now());
    return Math.floor(remaining / 1000);
  }

  /**
   * Clear all cache
   */
  public async clear(): Promise<void> {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  /**
   * Get multiple values
   */
  public async getMany<T = any>(keys: string[]): Promise<Array<T | null>> {
    const results: Array<T | null> = [];

    for (const key of keys) {
      results.push(await this.get<T>(key));
    }

    return results;
  }

  /**
   * Set multiple values
   */
  public async setMany<T = any>(
    entries: Array<{ key: string; value: T; options?: CacheOptions }>
  ): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.options);
    }
  }

  /**
   * Increment numeric value
   */
  public async increment(key: string, amount = 1): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = current + amount;

    await this.set(key, newValue);

    return newValue;
  }

  /**
   * Decrement numeric value
   */
  public async decrement(key: string, amount = 1): Promise<number> {
    return await this.increment(key, -amount);
  }

  /**
   * Invalidate cache by tag
   */
  public async invalidateByTag(tag: string): Promise<number> {
    const keys = await this.getKeysByTag(tag);
    return await this.deleteMany(keys);
  }

  /**
   * Get cache statistics
   */
  public async getStats(): Promise<CacheStats> {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    const avgGetLatency =
      this.stats.getLatencies.length > 0
        ? this.stats.getLatencies.reduce((a, b) => a + b, 0) /
          this.stats.getLatencies.length
        : 0;

    const avgSetLatency =
      this.stats.setLatencies.length > 0
        ? this.stats.setLatencies.reduce((a, b) => a + b, 0) /
          this.stats.setLatencies.length
        : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      keys: this.cache.size,
      memoryUsage: 0, // Would be calculated from actual Redis in production
      avgGetLatency: Math.round(avgGetLatency * 100) / 100,
      avgSetLatency: Math.round(avgSetLatency * 100) / 100,
    };
  }

  /**
   * Reset cache statistics
   */
  public resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      gets: 0,
      sets: 0,
      getLatencies: [],
      setLatencies: [],
    };
  }

  /**
   * Get full cache key with prefix
   */
  private getFullKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  /**
   * Add key to tag set
   */
  private async addToTagSet(tag: string, key: string): Promise<void> {
    const tagKey = `${this.config.keyPrefix}tag:${tag}`;
    const tagSet = this.cache.get(tagKey) || { value: new Set<string>() };

    (tagSet.value as Set<string>).add(key);
    this.cache.set(tagKey, tagSet);
  }

  /**
   * Get keys by tag
   */
  private async getKeysByTag(tag: string): Promise<string[]> {
    const tagKey = `${this.config.keyPrefix}tag:${tag}`;
    const tagSet = this.cache.get(tagKey);

    if (!tagSet || !(tagSet.value instanceof Set)) {
      return [];
    }

    return Array.from(tagSet.value as Set<string>);
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<{
    healthy: boolean;
    latency?: number;
    error?: string;
  }> {
    try {
      const startTime = Date.now();
      const testKey = `health:${Date.now()}`;

      await this.set(testKey, 'test', { ttl: 10 });
      await this.get(testKey);
      await this.delete(testKey);

      const latency = Date.now() - startTime;

      return {
        healthy: true,
        latency,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Singleton instance
 */
let redisCacheInstance: RedisCache | null = null;

/**
 * Get Redis cache instance
 */
export function getRedisCache(config?: RedisCacheConfig): RedisCache {
  if (!redisCacheInstance) {
    redisCacheInstance = new RedisCache(config);
  }
  return redisCacheInstance;
}

/**
 * Initialize Redis cache
 */
export async function initializeRedisCache(
  config?: RedisCacheConfig
): Promise<RedisCache> {
  const cache = getRedisCache(config);
  await cache.connect();
  return cache;
}

