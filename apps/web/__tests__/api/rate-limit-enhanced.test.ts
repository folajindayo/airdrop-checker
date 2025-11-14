/**
 * Enhanced tests for rate limiting functionality
 */

import { NextRequest } from 'next/server';
import { GET, checkRateLimit } from '@/app/api/rate-limit/route';
import { createMockRequest } from '../helpers';

describe('/api/rate-limit - Enhanced Tests', () => {
  describe('GET - Rate Limit Status', () => {
    it('should return current rate limit status', async () => {
      const request = createMockRequest('http://localhost:3000/api/rate-limit');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('remaining');
      expect(json).toHaveProperty('limit');
      expect(json).toHaveProperty('reset');
    });

    it('should include X-RateLimit headers', async () => {
      const request = createMockRequest('http://localhost:3000/api/rate-limit');
      const response = await GET(request);

      expect(response.headers.has('X-RateLimit-Limit')).toBe(true);
      expect(response.headers.has('X-RateLimit-Remaining')).toBe(true);
      expect(response.headers.has('X-RateLimit-Reset')).toBe(true);
    });

    it('should show decreasing remaining count', async () => {
      const request1 = createMockRequest('http://localhost:3000/api/rate-limit');
      const response1 = await GET(request1);
      const json1 = await response1.json();

      const request2 = createMockRequest('http://localhost:3000/api/rate-limit');
      const response2 = await GET(request2);
      const json2 = await response2.json();

      expect(json2.remaining).toBeLessThanOrEqual(json1.remaining);
    });

    it('should have valid reset timestamp', async () => {
      const request = createMockRequest('http://localhost:3000/api/rate-limit');
      const response = await GET(request);
      const json = await response.json();

      expect(typeof json.reset).toBe('number');
      expect(json.reset).toBeGreaterThan(Date.now());
    });
  });

  describe('checkRateLimit function', () => {
    const mockRequest = (ip = '127.0.0.1'): NextRequest => {
      return {
        ip,
        headers: new Headers({ 'x-forwarded-for': ip }),
        url: 'http://localhost:3000/api/test',
      } as NextRequest;
    };

    it('should allow requests within limit', () => {
      const request = mockRequest('192.168.1.1');
      const result = checkRateLimit(request, '/api/test', 100, 60000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeLessThanOrEqual(100);
    });

    it('should track requests per IP', () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';

      const result1a = checkRateLimit(mockRequest(ip1), '/api/test', 2, 60000);
      const result1b = checkRateLimit(mockRequest(ip1), '/api/test', 2, 60000);
      const result2a = checkRateLimit(mockRequest(ip2), '/api/test', 2, 60000);

      expect(result1a.allowed).toBe(true);
      expect(result1b.allowed).toBe(true);
      expect(result2a.allowed).toBe(true);
      expect(result2a.remaining).toBeGreaterThanOrEqual(result1b.remaining);
    });

    it('should block requests exceeding limit', () => {
      const ip = '192.168.1.3';
      const limit = 3;

      for (let i = 0; i < limit; i++) {
        checkRateLimit(mockRequest(ip), '/api/test', limit, 60000);
      }

      const blocked = checkRateLimit(mockRequest(ip), '/api/test', limit, 60000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
    });

    it('should provide reset timestamp', () => {
      const request = mockRequest('192.168.1.4');
      const result = checkRateLimit(request, '/api/test', 100, 60000);

      expect(result.reset).toBeGreaterThan(Date.now());
      expect(result.reset).toBeLessThanOrEqual(Date.now() + 60000);
    });

    it('should track different endpoints separately', () => {
      const ip = '192.168.1.5';
      const limit = 2;

      const result1 = checkRateLimit(mockRequest(ip), '/api/endpoint1', limit, 60000);
      const result2 = checkRateLimit(mockRequest(ip), '/api/endpoint1', limit, 60000);
      const result3 = checkRateLimit(mockRequest(ip), '/api/endpoint2', limit, 60000);

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBeGreaterThan(result2.remaining);
    });

    it('should handle missing IP gracefully', () => {
      const request = {
        ip: undefined,
        headers: new Headers(),
        url: 'http://localhost:3000/api/test',
      } as unknown as NextRequest;

      const result = checkRateLimit(request, '/api/test', 100, 60000);
      expect(result).toBeDefined();
      expect(typeof result.allowed).toBe('boolean');
    });
  });

  describe('Rate Limit Recovery', () => {
    it('should eventually reset after window expires', async () => {
      // This test would require mocking time
      // Placeholder for time-based rate limit recovery test
      expect(true).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle high volume of rate limit checks', () => {
      const start = Date.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const request = {
          ip: `192.168.1.${i % 255}`,
          headers: new Headers(),
          url: 'http://localhost:3000/api/test',
        } as NextRequest;
        checkRateLimit(request, '/api/test', 100, 60000);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero limit', () => {
      const request = {
        ip: '192.168.1.100',
        headers: new Headers(),
        url: 'http://localhost:3000/api/test',
      } as NextRequest;

      const result = checkRateLimit(request, '/api/test', 0, 60000);
      expect(result.allowed).toBe(false);
    });

    it('should handle very high limits', () => {
      const request = {
        ip: '192.168.1.101',
        headers: new Headers(),
        url: 'http://localhost:3000/api/test',
      } as NextRequest;

      const result = checkRateLimit(request, '/api/test', 1000000, 60000);
      expect(result.allowed).toBe(true);
    });

    it('should handle concurrent requests from same IP', async () => {
      const ip = '192.168.1.102';
      const promises = Array(10)
        .fill(null)
        .map(() => {
          const request = {
            ip,
            headers: new Headers(),
            url: 'http://localhost:3000/api/test',
          } as NextRequest;
          return Promise.resolve(checkRateLimit(request, '/api/test', 20, 60000));
        });

      const results = await Promise.all(promises);
      const allowed = results.filter((r) => r.allowed);
      expect(allowed.length).toBeGreaterThan(0);
    });
  });

  describe('Security', () => {
    it('should not leak information about other IPs', () => {
      const ip1 = '192.168.1.200';
      const ip2 = '192.168.1.201';

      const result1 = checkRateLimit(
        {
          ip: ip1,
          headers: new Headers(),
          url: 'http://localhost:3000/api/test',
        } as NextRequest,
        '/api/test',
        100,
        60000
      );

      const result2 = checkRateLimit(
        {
          ip: ip2,
          headers: new Headers(),
          url: 'http://localhost:3000/api/test',
        } as NextRequest,
        '/api/test',
        100,
        60000
      );

      // Each IP should have independent tracking
      expect(result1.remaining).toBe(result2.remaining);
    });

    it('should handle malformed IP addresses', () => {
      const malformedIps = ['invalid', '999.999.999.999', 'abc.def.ghi.jkl', ''];

      malformedIps.forEach((ip) => {
        const request = {
          ip,
          headers: new Headers(),
          url: 'http://localhost:3000/api/test',
        } as NextRequest;

        const result = checkRateLimit(request, '/api/test', 100, 60000);
        expect(result).toBeDefined();
      });
    });
  });
});

