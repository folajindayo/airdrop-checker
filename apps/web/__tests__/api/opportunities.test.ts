/**
 * Tests for /api/opportunities/[address] route
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/opportunities/[address]/route';

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
  checkCriteria: jest.fn(() => false), // Mock as not meeting criteria
}));

jest.mock('@/lib/db/models/project', () => ({
  findAllProjects: jest.fn(() => [
    {
      projectId: 'project-1',
      name: 'Test Project',
      slug: 'test-project',
      status: 'confirmed',
      criteria: [{ description: 'Swap on Uniswap' }],
      snapshotDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      estimatedValue: '$100-$500',
      chains: ['ethereum'],
    },
    {
      projectId: 'project-2',
      name: 'Another Project',
      slug: 'another-project',
      status: 'rumored',
      criteria: [{ description: 'Bridge to Base' }],
      chains: ['base'],
    },
  ]),
}));

describe('/api/opportunities/[address]', () => {
  const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  describe('GET', () => {
    it('should return opportunities for valid address', async () => {
      const request = new NextRequest(`http://localhost:3000/api/opportunities/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.address).toBe(validAddress.toLowerCase());
      expect(data.opportunities).toBeDefined();
      expect(Array.isArray(data.opportunities)).toBe(true);
      expect(data.categories).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it('should return error for invalid address', async () => {
      const invalidAddress = 'invalid-address';
      const request = new NextRequest(`http://localhost:3000/api/opportunities/${invalidAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: invalidAddress }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Invalid Ethereum address');
    });

    it('should include opportunity details', async () => {
      const request = new NextRequest(`http://localhost:3000/api/opportunities/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      if (data.opportunities.length > 0) {
        const opportunity = data.opportunities[0];
        expect(opportunity).toHaveProperty('projectId');
        expect(opportunity).toHaveProperty('name');
        expect(opportunity).toHaveProperty('status');
        expect(opportunity).toHaveProperty('currentScore');
        expect(opportunity).toHaveProperty('opportunityScore');
        expect(opportunity).toHaveProperty('effortNeeded');
        expect(opportunity).toHaveProperty('missingCriteria');
      }
    });

    it('should include categorized opportunities', async () => {
      const request = new NextRequest(`http://localhost:3000/api/opportunities/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(data.categories).toBeDefined();
      expect(data.categories).toHaveProperty('easyWins');
      expect(data.categories).toHaveProperty('highValue');
      expect(data.categories).toHaveProperty('quickActions');
      expect(Array.isArray(data.categories.easyWins)).toBe(true);
      expect(Array.isArray(data.categories.highValue)).toBe(true);
      expect(Array.isArray(data.categories.quickActions)).toBe(true);
    });

    it('should only return incomplete opportunities', async () => {
      const request = new NextRequest(`http://localhost:3000/api/opportunities/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      // All opportunities should have currentScore < 100
      expect(data.opportunities.every((opp: any) => opp.currentScore < 100)).toBe(true);
    });

    it('should sort opportunities by opportunity score', async () => {
      const request = new NextRequest(`http://localhost:3000/api/opportunities/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      if (data.opportunities.length > 1) {
        for (let i = 0; i < data.opportunities.length - 1; i++) {
          expect(data.opportunities[i].opportunityScore).toBeGreaterThanOrEqual(
            data.opportunities[i + 1].opportunityScore
          );
        }
      }
    });

    it('should limit opportunities to 20', async () => {
      const request = new NextRequest(`http://localhost:3000/api/opportunities/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(data.opportunities.length).toBeLessThanOrEqual(20);
    });
  });
});

