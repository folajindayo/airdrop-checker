/**
 * Tests for /api/roi route
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/roi/route';
import { isValidAddress } from '@airdrop-finder/shared';

// Mock dependencies
jest.mock('@/lib/goldrush', () => ({
  fetchAllChainTransactions: jest.fn(() => ({
    '1': [
      { gas_used: 21000, gas_price: '25000000000' },
      { gas_used: 100000, gas_price: '30000000000' },
    ],
    '8453': [
      { gas_used: 50000, gas_price: '200000000' },
    ],
  })),
}));

jest.mock('@/lib/db/models/project', () => ({
  findAllProjects: jest.fn(() => [
    {
      projectId: 'project-1',
      name: 'Test Project',
      estimatedValue: '$100-$500',
    },
  ]),
}));

// Mock fetch for airdrop-check endpoint
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({
      airdrops: [
        {
          projectId: 'project-1',
          score: 75,
        },
      ],
    }),
  })
) as jest.Mock;

describe('/api/roi', () => {
  describe('POST', () => {
    const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

    it('should calculate ROI for valid address', async () => {
      const request = new NextRequest('http://localhost:3000/api/roi', {
        method: 'POST',
        body: JSON.stringify({ address: validAddress }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.address).toBe(validAddress.toLowerCase());
      expect(data.totalGasSpent).toBeDefined();
      expect(typeof data.totalGasSpent).toBe('number');
      expect(data.potentialAirdropValue).toBeDefined();
      expect(typeof data.potentialAirdropValue).toBe('number');
      expect(data.roi).toBeDefined();
      expect(typeof data.roi).toBe('number');
      expect(data.breakEvenValue).toBeDefined();
      expect(data.topOpportunities).toBeDefined();
      expect(Array.isArray(data.topOpportunities)).toBe(true);
      expect(data.timestamp).toBeDefined();
    });

    it('should calculate ROI with gas price multiplier', async () => {
      const request = new NextRequest('http://localhost:3000/api/roi', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          gasPriceMultiplier: 1.5,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.totalGasSpent).toBeDefined();
    });

    it('should return error for invalid address', async () => {
      const request = new NextRequest('http://localhost:3000/api/roi', {
        method: 'POST',
        body: JSON.stringify({ address: 'invalid-address' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Valid address required');
    });

    it('should return error when address is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/roi', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should include top opportunities in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/roi', {
        method: 'POST',
        body: JSON.stringify({ address: validAddress }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.topOpportunities).toBeDefined();
      if (data.topOpportunities.length > 0) {
        const opportunity = data.topOpportunities[0];
        expect(opportunity).toHaveProperty('projectId');
        expect(opportunity).toHaveProperty('projectName');
        expect(opportunity).toHaveProperty('score');
        expect(opportunity).toHaveProperty('gasToQualify');
        expect(opportunity).toHaveProperty('potentialROI');
      }
    });

    it('should handle zero gas spent scenario', async () => {
      // Mock empty transactions
      const { fetchAllChainTransactions } = require('@/lib/goldrush');
      fetchAllChainTransactions.mockResolvedValueOnce({});

      const request = new NextRequest('http://localhost:3000/api/roi', {
        method: 'POST',
        body: JSON.stringify({ address: validAddress }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalGasSpent).toBe(0);
      expect(data.roi).toBe(0);
    });
  });
});

