/**
 * Tests for /api/rate-limit route
 */

import { NextRequest } from 'next/server';
import { GET, checkRateLimit } from '@/app/api/rate-limit/route';

describe('/api/rate-limit', () => {
  describe('GET', () => {
    it('should return rate limit info for default endpoint', async () => {
      const request = new NextRequest('http://localhost:3000/api/rate-limit');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.endpoint).toBeDefined();
      expect(data.limit).toBeDefined();
      expect(typeof data.limit).toBe('number');
      expect(data.window).toBeDefined();
      expect(data.remaining).toBeDefined();
      expect(data.resetAt).toBeDefined();
      expect(data.used).toBeDefined();
    });

    it('should return rate limit info for specific endpoint', async () => {
      const request = new NextRequest('http://localhost:3000/api/rate-limit?endpoint=/api/airdrop-check');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.endpoint).toBe('/api/airdrop-check');
      expect(data.limit).toBe(100);
      expect(data.window).toBe(3600);
    });

    it('should return rate limit info for address-specific endpoint', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const request = new NextRequest(`http://localhost:3000/api/rate-limit?endpoint=/api/airdrop-check&address=${address}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.endpoint).toBe('/api/airdrop-check');
      expect(data.remaining).toBeDefined();
    });

    it('should calculate remaining requests correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/rate-limit?endpoint=/api/portfolio');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.remaining).toBeGreaterThanOrEqual(0);
      expect(data.remaining).toBeLessThanOrEqual(data.limit);
      expect(data.used + data.remaining).toBeLessThanOrEqual(data.limit);
    });

    it('should return reset time in ISO format', async () => {
      const request = new NextRequest('http://localhost:3000/api/rate-limit');
      const response = await GET(request);
      const data = await response.json();

      expect(data.resetAt).toBeDefined();
      expect(typeof data.resetAt).toBe('string');
      expect(new Date(data.resetAt).toISOString()).toBe(data.resetAt);
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const result = checkRateLimit('/api/test', '0x123');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
      expect(result.resetAt).toBeDefined();
    });

    it('should track rate limit per endpoint and address', () => {
      const address1 = '0x1111111111111111111111111111111111111111';
      const address2 = '0x2222222222222222222222222222222222222222';

      const result1 = checkRateLimit('/api/test', address1);
      const result2 = checkRateLimit('/api/test', address2);

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });

    it('should return remaining count', () => {
      const result = checkRateLimit('/api/test');
      expect(result.remaining).toBeDefined();
      expect(typeof result.remaining).toBe('number');
      expect(result.remaining).toBeGreaterThanOrEqual(0);
    });

    it('should return reset timestamp', () => {
      const result = checkRateLimit('/api/test');
      expect(result.resetAt).toBeDefined();
      expect(typeof result.resetAt).toBe('number');
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });
  });
});

