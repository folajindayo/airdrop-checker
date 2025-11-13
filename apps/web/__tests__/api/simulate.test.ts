/**
 * Tests for /api/simulate route
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/simulate/route';

// Mock dependencies
jest.mock('@/lib/goldrush', () => ({
  fetchAllChainTransactions: jest.fn(() => ({})),
  fetchAllChainNFTs: jest.fn(() => ({})),
}));

jest.mock('@/lib/analyzers/activity-aggregator', () => ({
  aggregateUserActivity: jest.fn(() => ({
    swaps: {},
    nftPlatforms: {},
    bridges: {},
    lendingProtocols: {},
    chains: {},
  })),
}));

jest.mock('@/lib/analyzers/criteria-checker', () => ({
  checkCriteria: jest.fn(() => true),
}));

jest.mock('@/lib/db/models/project', () => ({
  findAllProjects: jest.fn(() => [
    {
      projectId: 'project-1',
      name: 'Test Project',
      slug: 'test-project',
      status: 'active',
      criteria: [{ description: 'Swap on Uniswap' }],
    },
  ]),
}));

// Mock fetch for airdrop-check endpoint
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({
      overallScore: 50,
      airdrops: [
        {
          projectId: 'project-1',
          score: 50,
        },
      ],
    }),
  })
) as jest.Mock;

describe('/api/simulate', () => {
  describe('POST', () => {
    const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

    it('should simulate eligibility with valid data', async () => {
      const request = new NextRequest('http://localhost:3000/api/simulate', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          simulatedInteractions: [
            { type: 'swap', protocol: 'uniswap', chain: 'ethereum', count: 5 },
          ],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.address).toBe(validAddress.toLowerCase());
      expect(data.currentScore).toBeDefined();
      expect(data.simulatedScore).toBeDefined();
      expect(data.improvement).toBeDefined();
      expect(data.airdrops).toBeDefined();
      expect(Array.isArray(data.airdrops)).toBe(true);
      expect(data.simulatedInteractions).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it('should handle multiple interaction types', async () => {
      const request = new NextRequest('http://localhost:3000/api/simulate', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          simulatedInteractions: [
            { type: 'swap', protocol: 'uniswap', chain: 'ethereum', count: 3 },
            { type: 'nft_mint', protocol: 'opensea', chain: 'base', count: 2 },
            { type: 'bridge', protocol: 'hop', chain: 'arbitrum', count: 1 },
            { type: 'lend', protocol: 'aave', chain: 'ethereum', count: 4 },
          ],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.airdrops.length).toBeGreaterThan(0);
    });

    it('should return error for invalid address', async () => {
      const request = new NextRequest('http://localhost:3000/api/simulate', {
        method: 'POST',
        body: JSON.stringify({
          address: 'invalid-address',
          simulatedInteractions: [],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Valid address required');
    });

    it('should return error when address is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/simulate', {
        method: 'POST',
        body: JSON.stringify({
          simulatedInteractions: [],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return error when simulatedInteractions is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/simulate', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('simulatedInteractions array required');
    });

    it('should return error when simulatedInteractions is not an array', async () => {
      const request = new NextRequest('http://localhost:3000/api/simulate', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          simulatedInteractions: 'not-an-array',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should calculate improvement correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/simulate', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          simulatedInteractions: [
            { type: 'swap', protocol: 'uniswap', chain: 'ethereum', count: 10 },
          ],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.improvement).toBe(data.simulatedScore - data.currentScore);
      
      if (data.airdrops.length > 0) {
        expect(data.airdrops[0]).toHaveProperty('improvement');
      }
    });
  });
});

