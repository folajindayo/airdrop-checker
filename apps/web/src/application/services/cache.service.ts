/**
 * Cache Service
 */

import { cacheClient } from '@/infrastructure/cache/redis.client';

export class CacheService {
  private defaultTTL = 300; // 5 minutes

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await cacheClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await cacheClient.set(key, JSON.stringify(value), ttl || this.defaultTTL);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      await cacheClient.clear(pattern);
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  buildKey(...parts: (string | number)[]): string {
    return parts.join(':');
  }
}

export const cacheService = new CacheService();

