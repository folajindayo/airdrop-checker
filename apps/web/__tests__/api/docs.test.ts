/**
 * Tests for /api/docs route
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/docs/route';

describe('/api/docs', () => {
  describe('GET', () => {
    it('should return API documentation', async () => {
      const request = new NextRequest('http://localhost:3000/api/docs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.version).toBeDefined();
      expect(data.baseUrl).toBeDefined();
      expect(data.endpoints).toBeDefined();
      expect(Array.isArray(data.endpoints)).toBe(true);
    });

    it('should include required documentation fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/docs');
      const response = await GET(request);
      const data = await response.json();

      expect(data.version).toBe('1.0.0');
      expect(data.endpoints.length).toBeGreaterThan(0);
    });

    it('should include airdrop-check endpoint documentation', async () => {
      const request = new NextRequest('http://localhost:3000/api/docs');
      const response = await GET(request);
      const data = await response.json();

      const airdropCheckEndpoint = data.endpoints.find(
        (e: any) => e.path === '/api/airdrop-check/[address]'
      );

      expect(airdropCheckEndpoint).toBeDefined();
      expect(airdropCheckEndpoint.method).toBe('GET');
      expect(airdropCheckEndpoint.description).toBeDefined();
      expect(airdropCheckEndpoint.parameters).toBeDefined();
      expect(Array.isArray(airdropCheckEndpoint.parameters)).toBe(true);
      expect(airdropCheckEndpoint.response).toBeDefined();
    });

    it('should include portfolio endpoint documentation', async () => {
      const request = new NextRequest('http://localhost:3000/api/docs');
      const response = await GET(request);
      const data = await response.json();

      const portfolioEndpoint = data.endpoints.find(
        (e: any) => e.path === '/api/portfolio/[address]'
      );

      expect(portfolioEndpoint).toBeDefined();
      expect(portfolioEndpoint.method).toBe('GET');
      expect(portfolioEndpoint.description).toBeDefined();
    });

    it('should include authentication information', async () => {
      const request = new NextRequest('http://localhost:3000/api/docs');
      const response = await GET(request);
      const data = await response.json();

      expect(data.authentication).toBeDefined();
      expect(data.authentication.type).toBeDefined();
      expect(data.authentication.header).toBeDefined();
      expect(data.authentication.description).toBeDefined();
    });

    it('should include rate limit information', async () => {
      const request = new NextRequest('http://localhost:3000/api/docs');
      const response = await GET(request);
      const data = await response.json();

      expect(data.rateLimits).toBeDefined();
      expect(data.rateLimits.default).toBeDefined();
      expect(data.rateLimits.endpoints).toBeDefined();
    });

    it('should include error codes', async () => {
      const request = new NextRequest('http://localhost:3000/api/docs');
      const response = await GET(request);
      const data = await response.json();

      expect(data.errorCodes).toBeDefined();
      expect(data.errorCodes['400']).toBeDefined();
      expect(data.errorCodes['401']).toBeDefined();
      expect(data.errorCodes['404']).toBeDefined();
      expect(data.errorCodes['500']).toBeDefined();
    });

    it('should include examples', async () => {
      const request = new NextRequest('http://localhost:3000/api/docs');
      const response = await GET(request);
      const data = await response.json();

      expect(data.examples).toBeDefined();
      expect(data.examples.curl).toBeDefined();
    });
  });
});

