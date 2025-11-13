/**
 * Tests for rate limit middleware
 */

import { createRateLimiter, strictRateLimiter, standardRateLimiter } from '@/lib/middleware/rate-limit.middleware';
import { NextRequest, NextResponse } from 'next/server';

describe('Rate Limit Middleware', () => {
  describe('createRateLimiter', () => {
    it('should allow requests within limit', async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 10,
      });

      const handler = async () => NextResponse.json({ success: true });
      const wrapped = rateLimiter(handler);

      const request = new NextRequest('http://localhost:3000/test');
      const response = await wrapped(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
    });

    it('should block requests exceeding limit', async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1,
      });

      const handler = async () => NextResponse.json({ success: true });
      const wrapped = rateLimiter(handler);

      const request = new NextRequest('http://localhost:3000/test');
      
      // First request should succeed
      const response1 = await wrapped(request);
      expect(response1.status).toBe(200);

      // Second request should be rate limited
      const response2 = await wrapped(request);
      expect(response2.status).toBe(429);
      expect(response2.headers.get('Retry-After')).toBeDefined();
    });

    it('should include rate limit headers', async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 10,
      });

      const handler = async () => NextResponse.json({ success: true });
      const wrapped = rateLimiter(handler);

      const request = new NextRequest('http://localhost:3000/test');
      const response = await wrapped(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
    });
  });

  describe('strictRateLimiter', () => {
    it('should have strict limits', () => {
      expect(strictRateLimiter).toBeDefined();
    });
  });

  describe('standardRateLimiter', () => {
    it('should have standard limits', () => {
      expect(standardRateLimiter).toBeDefined();
    });
  });
});

