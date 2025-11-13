/**
 * Tests for /api/performance route
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/performance/route';

describe('/api/performance', () => {
  describe('GET', () => {
    it('should return performance metrics', async () => {
      const request = new NextRequest('http://localhost:3000/api/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metrics).toBeDefined();
      expect(data.healthScore).toBeDefined();
      expect(data.status).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it('should include API metrics', async () => {
      const request = new NextRequest('http://localhost:3000/api/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(data.metrics.api).toBeDefined();
      expect(data.metrics.api).toHaveProperty('averageResponseTime');
      expect(data.metrics.api).toHaveProperty('totalRequests');
      expect(data.metrics.api).toHaveProperty('errorRate');
      expect(data.metrics.api).toHaveProperty('requestsPerSecond');
    });

    it('should include database metrics', async () => {
      const request = new NextRequest('http://localhost:3000/api/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(data.metrics.database).toBeDefined();
      expect(data.metrics.database).toHaveProperty('queryTime');
      expect(data.metrics.database).toHaveProperty('connectionPool');
      expect(data.metrics.database).toHaveProperty('activeConnections');
    });

    it('should include cache metrics', async () => {
      const request = new NextRequest('http://localhost:3000/api/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(data.metrics.cache).toBeDefined();
      expect(data.metrics.cache).toHaveProperty('hitRate');
      expect(data.metrics.cache).toHaveProperty('missRate');
      expect(data.metrics.cache).toHaveProperty('totalSize');
    });

    it('should include system metrics', async () => {
      const request = new NextRequest('http://localhost:3000/api/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(data.metrics.system).toBeDefined();
      expect(data.metrics.system).toHaveProperty('memoryUsage');
      expect(data.metrics.system).toHaveProperty('cpuUsage');
      expect(data.metrics.system).toHaveProperty('uptime');
    });

    it('should calculate health score', async () => {
      const request = new NextRequest('http://localhost:3000/api/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(data.healthScore).toBeDefined();
      expect(typeof data.healthScore).toBe('number');
      expect(data.healthScore).toBeGreaterThanOrEqual(0);
      expect(data.healthScore).toBeLessThanOrEqual(100);
    });

    it('should return status based on health score', async () => {
      const request = new NextRequest('http://localhost:3000/api/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(data.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(data.status);
    });

    it('should return timestamp in ISO format', async () => {
      const request = new NextRequest('http://localhost:3000/api/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(data.timestamp).toBeDefined();
      expect(typeof data.timestamp).toBe('string');
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });
  });
});

