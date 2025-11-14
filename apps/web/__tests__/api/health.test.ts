/**
 * Tests for /api/health route
 */

import { GET } from '@/app/api/health/route';
import { createMockRequest } from '../helpers';

describe('/api/health', () => {
  describe('GET - Basic Health Checks', () => {
    it('should return health status', async () => {
      const request = createMockRequest('http://localhost:3000/api/health');

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('status');
      expect(json).toHaveProperty('timestamp');
    });

    it('should return healthy status', async () => {
      const request = createMockRequest('http://localhost:3000/api/health');

      const response = await GET();
      const json = await response.json();

      expect(json.status).toBe('healthy');
    });

    it('should include timestamp in ISO format', async () => {
      const response = await GET();
      const json = await response.json();

      expect(json).toHaveProperty('timestamp');
      expect(typeof json.timestamp).toBe('string');
      const date = new Date(json.timestamp);
      expect(date.toISOString()).toBe(json.timestamp);
    });

    it('should include uptime information', async () => {
      const response = await GET();
      const json = await response.json();

      expect(json).toHaveProperty('uptime');
      expect(typeof json.uptime).toBe('number');
      expect(json.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should include version information', async () => {
      const response = await GET();
      const json = await response.json();

      expect(json).toHaveProperty('version');
      expect(typeof json.version).toBe('string');
      expect(json.version.length).toBeGreaterThan(0);
    });

    it('should include environment information', async () => {
      const response = await GET();
      const json = await response.json();

      expect(json).toHaveProperty('environment');
      expect(['development', 'production', 'test']).toContain(json.environment);
    });
  });

  describe('GET - Service Checks', () => {
    it('should include database health status', async () => {
      const response = await GET();
      const json = await response.json();

      expect(json).toHaveProperty('services');
      expect(json.services).toHaveProperty('database');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(json.services.database);
    });

    it('should include cache health status', async () => {
      const response = await GET();
      const json = await response.json();

      expect(json.services).toHaveProperty('cache');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(json.services.cache);
    });

    it('should include API dependencies health status', async () => {
      const response = await GET();
      const json = await response.json();

      expect(json.services).toHaveProperty('externalAPIs');
      expect(typeof json.services.externalAPIs).toBe('string');
    });
  });

  describe('GET - System Metrics', () => {
    it('should include memory usage information', async () => {
      const response = await GET();
      const json = await response.json();

      if (json.metrics) {
        expect(json.metrics).toHaveProperty('memory');
        expect(typeof json.metrics.memory.used).toBe('number');
        expect(typeof json.metrics.memory.total).toBe('number');
      }
    });

    it('should include request count', async () => {
      const response = await GET();
      const json = await response.json();

      if (json.metrics) {
        expect(json.metrics).toHaveProperty('requestCount');
        expect(typeof json.metrics.requestCount).toBe('number');
        expect(json.metrics.requestCount).toBeGreaterThanOrEqual(0);
      }
    });

    it('should include error rate', async () => {
      const response = await GET();
      const json = await response.json();

      if (json.metrics) {
        expect(json.metrics).toHaveProperty('errorRate');
        expect(typeof json.metrics.errorRate).toBe('number');
        expect(json.metrics.errorRate).toBeGreaterThanOrEqual(0);
      }
    });

    it('should include average response time', async () => {
      const response = await GET();
      const json = await response.json();

      if (json.metrics) {
        expect(json.metrics).toHaveProperty('averageResponseTime');
        expect(typeof json.metrics.averageResponseTime).toBe('number');
        expect(json.metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('GET - Response Format', () => {
    it('should return JSON content type', async () => {
      const response = await GET();

      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should not cache health check responses', async () => {
      const response = await GET();

      const cacheControl = response.headers.get('cache-control');
      expect(cacheControl).toBeTruthy();
      expect(cacheControl).toContain('no-cache');
    });

    it('should have consistent response structure', async () => {
      const response = await GET();
      const json = await response.json();

      expect(json).toHaveProperty('status');
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('uptime');
      expect(json).toHaveProperty('version');
      expect(json).toHaveProperty('services');
    });
  });

  describe('GET - Status Values', () => {
    it('should return valid status values', async () => {
      const response = await GET();
      const json = await response.json();

      expect(['healthy', 'degraded', 'unhealthy']).toContain(json.status);
    });

    it('should be consistent with service health', async () => {
      const response = await GET();
      const json = await response.json();

      if (json.status === 'healthy') {
        // If overall healthy, no services should be unhealthy
        Object.values(json.services).forEach((serviceStatus) => {
          expect(serviceStatus).not.toBe('unhealthy');
        });
      }
    });
  });

  describe('GET - Performance', () => {
    it('should respond quickly (health check should be fast)', async () => {
      const start = Date.now();
      await GET();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });

    it('should handle multiple concurrent health checks', async () => {
      const promises = Array.from({ length: 10 }, () => GET());
      
      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });

    it('should return consistent data on rapid successive calls', async () => {
      const response1 = await GET();
      const json1 = await response1.json();

      const response2 = await GET();
      const json2 = await response2.json();

      expect(json2.status).toBe(json1.status);
      expect(json2.version).toBe(json1.version);
    });
  });

  describe('GET - Edge Cases', () => {
    it('should handle health check during high load', async () => {
      // Simulate some load
      const loadPromises = Array.from({ length: 5 }, () => GET());
      await Promise.all(loadPromises);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.status).toBeDefined();
    });

    it('should include all required fields even under stress', async () => {
      const response = await GET();
      const json = await response.json();

      const requiredFields = ['status', 'timestamp', 'uptime', 'version', 'services'];
      requiredFields.forEach((field) => {
        expect(json).toHaveProperty(field);
      });
    });
  });

  describe('GET - API Contract', () => {
    it('should maintain stable API structure', async () => {
      const response = await GET();
      const json = await response.json();

      // Verify the shape hasn't changed
      expect(typeof json.status).toBe('string');
      expect(typeof json.timestamp).toBe('string');
      expect(typeof json.uptime).toBe('number');
      expect(typeof json.version).toBe('string');
      expect(typeof json.services).toBe('object');
    });

    it('should not expose sensitive information', async () => {
      const response = await GET();
      const json = await response.json();
      const responseStr = JSON.stringify(json);

      // Should not contain sensitive data
      expect(responseStr).not.toMatch(/password/i);
      expect(responseStr).not.toMatch(/secret/i);
      expect(responseStr).not.toMatch(/token/i);
      expect(responseStr).not.toMatch(/api[_-]?key/i);
    });
  });
});

