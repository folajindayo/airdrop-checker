/**
 * Tests for /api/insights/[address] route
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/insights/[address]/route';

// Mock dependencies
jest.mock('@/lib/goldrush', () => ({
  fetchAllChainTransactions: jest.fn(() => ({
    '1': [{ tx_hash: '0x123' }, { tx_hash: '0x456' }],
    '8453': [{ tx_hash: '0x789' }],
  })),
  fetchAllChainNFTs: jest.fn(() => ({
    '1': [{ token_id: '1' }],
  })),
}));

jest.mock('@/lib/analyzers/activity-aggregator', () => ({
  aggregateUserActivity: jest.fn(() => ({
    swaps: { uniswap: 5 },
    nftPlatforms: { opensea: 2 },
    bridges: {},
    lendingProtocols: {},
    chains: { '1': 10, '8453': 5 },
  })),
}));

jest.mock('@/lib/analyzers/criteria-checker', () => ({
  checkCriteria: jest.fn(() => false),
}));

jest.mock('@/lib/db/models/project', () => ({
  findAllProjects: jest.fn(() => [
    {
      projectId: 'project-1',
      name: 'Test Project',
      criteria: [
        { description: 'Swap on Uniswap' },
        { description: 'Bridge to Base' },
      ],
    },
  ]),
}));

describe('/api/insights/[address]', () => {
  const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  describe('GET', () => {
    it('should return insights for valid address', async () => {
      const request = new NextRequest(`http://localhost:3000/api/insights/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.address).toBe(validAddress.toLowerCase());
      expect(data.insights).toBeDefined();
      expect(data.activityPatterns).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it('should return error for invalid address', async () => {
      const invalidAddress = 'invalid-address';
      const request = new NextRequest(`http://localhost:3000/api/insights/${invalidAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: invalidAddress }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Invalid Ethereum address');
    });

    it('should include activity insights', async () => {
      const request = new NextRequest(`http://localhost:3000/api/insights/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(data.insights.activity).toBeDefined();
      expect(data.insights.activity).toHaveProperty('totalTransactions');
      expect(data.insights.activity).toHaveProperty('chainsUsed');
      expect(data.insights.activity).toHaveProperty('nftCount');
      expect(data.insights.activity).toHaveProperty('mostActiveChain');
    });

    it('should include eligibility insights', async () => {
      const request = new NextRequest(`http://localhost:3000/api/insights/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(data.insights.eligibility).toBeDefined();
      expect(data.insights.eligibility).toHaveProperty('totalProjects');
      expect(data.insights.eligibility).toHaveProperty('eligibleCount');
      expect(data.insights.eligibility).toHaveProperty('averageScore');
      expect(data.insights.eligibility).toHaveProperty('topScore');
      expect(data.insights.eligibility).toHaveProperty('improvementAreas');
    });

    it('should include recommendations', async () => {
      const request = new NextRequest(`http://localhost:3000/api/insights/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(data.insights.recommendations).toBeDefined();
      expect(Array.isArray(data.insights.recommendations)).toBe(true);
    });

    it('should include activity patterns', async () => {
      const request = new NextRequest(`http://localhost:3000/api/insights/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(data.activityPatterns).toBeDefined();
      expect(data.activityPatterns).toHaveProperty('isDiversified');
      expect(data.activityPatterns).toHaveProperty('isActive');
      expect(data.activityPatterns).toHaveProperty('hasNFTs');
      expect(data.activityPatterns).toHaveProperty('isMultiChain');
    });

    it('should calculate eligibility metrics correctly', async () => {
      const request = new NextRequest(`http://localhost:3000/api/insights/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(data.insights.eligibility.totalProjects).toBeGreaterThan(0);
      expect(data.insights.eligibility.averageScore).toBeGreaterThanOrEqual(0);
      expect(data.insights.eligibility.averageScore).toBeLessThanOrEqual(100);
      expect(data.insights.eligibility.topScore).toBeGreaterThanOrEqual(0);
      expect(data.insights.eligibility.topScore).toBeLessThanOrEqual(100);
    });
  });
});

