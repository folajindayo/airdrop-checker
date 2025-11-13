/**
 * Tests for /api/cache route
 */

import { NextRequest } from 'next/server';
import { GET, DELETE } from '@/app/api/cache/route';

describe('/api/cache', () => {
  describe('GET', () => {
    it('should return cache information by default', async () => {
      const request = new NextRequest('http://localhost:3000/api/cache');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.cache).toBeDefined();
      expect(data.cache.enabled).toBe(true);
      expect(data.cache.type).toBeDefined();
      expect(data.cache.defaultTTL).toBeDefined();
      expect(data.cache.maxSize).toBeDefined();
      expect(data.endpoints).toBeDefined();
    });

    it('should return cache statistics when action=stats', async () => {
      const request = new NextRequest('http://localhost:3000/api/cache?action=stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.stats).toBeDefined();
      expect(data.stats.totalKeys).toBeDefined();
      expect(data.stats.hitRate).toBeDefined();
      expect(data.stats.missRate).toBeDefined();
      expect(data.stats.totalSize).toBeDefined();
    });

    it('should clear cache when action=clear', async () => {
      const request = new NextRequest('http://localhost:3000/api/cache?action=clear');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBeDefined();
      expect(data.message).toContain('cleared');
      expect(data.clearedAt).toBeDefined();
    });

    it('should include endpoint TTL information', async () => {
      const request = new NextRequest('http://localhost:3000/api/cache');
      const response = await GET(request);
      const data = await response.json();

      expect(data.endpoints).toBeDefined();
      expect(data.endpoints['/api/airdrop-check']).toBeDefined();
      expect(data.endpoints['/api/portfolio']).toBeDefined();
      expect(data.endpoints['/api/airdrops']).toBeDefined();
    });
  });

  describe('DELETE', () => {
    it('should clear cache entries matching pattern', async () => {
      const request = new NextRequest('http://localhost:3000/api/cache?pattern=airdrop-check:*', {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBeDefined();
      expect(data.message).toContain('cleared');
      expect(data.clearedAt).toBeDefined();
    });

    it('should return error when pattern is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/cache', {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Pattern parameter required');
    });

    it('should handle different cache patterns', async () => {
      const patterns = ['airdrop-check:*', 'portfolio:*', 'user:*'];

      for (const pattern of patterns) {
        const request = new NextRequest(`http://localhost:3000/api/cache?pattern=${pattern}`, {
          method: 'DELETE',
        });
        const response = await DELETE(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain(pattern);
      }
    });
  });
});

