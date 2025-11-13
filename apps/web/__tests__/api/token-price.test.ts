/**
 * Tests for /api/token-price route
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/token-price/route';

describe('/api/token-price', () => {
  describe('GET', () => {
    it('should return all tokens when no parameters provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/token-price');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.tokens).toBeDefined();
      expect(Array.isArray(data.tokens)).toBe(true);
      expect(data.count).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it('should return specific token when token parameter is provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/token-price?token=ARB');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.token).toBeDefined();
      expect(data.token.symbol).toBe('ARB');
      expect(data.token.name).toBe('Arbitrum');
      expect(data.token.price).toBeDefined();
      expect(data.token.change24h).toBeDefined();
      expect(data.token.marketCap).toBeDefined();
      expect(data.token.volume24h).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it('should return error for unknown token', async () => {
      const request = new NextRequest('http://localhost:3000/api/token-price?token=UNKNOWN');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('not found');
    });

    it('should filter tokens by chain', async () => {
      const request = new NextRequest('http://localhost:3000/api/token-price?chain=ethereum');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.tokens).toBeDefined();
      expect(data.chain).toBe('ethereum');
      expect(data.tokens.every((t: any) => t.chain === 'ethereum')).toBe(true);
    });

    it('should return all tokens when chain=all', async () => {
      const request = new NextRequest('http://localhost:3000/api/token-price?chain=all');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.chain).toBe('all');
    });

    it('should handle case-insensitive token symbols', async () => {
      const request = new NextRequest('http://localhost:3000/api/token-price?token=arb');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.token.symbol).toBe('ARB');
    });

    it('should include all required token fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/token-price?token=ETH');
      const response = await GET(request);
      const data = await response.json();

      expect(data.token).toHaveProperty('symbol');
      expect(data.token).toHaveProperty('name');
      expect(data.token).toHaveProperty('price');
      expect(data.token).toHaveProperty('change24h');
      expect(data.token).toHaveProperty('marketCap');
      expect(data.token).toHaveProperty('volume24h');
      expect(data.token).toHaveProperty('chain');
    });
  });
});

