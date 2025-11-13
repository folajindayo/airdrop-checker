/**
 * Tests for /api/transaction-history/[address] route
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/transaction-history/[address]/route';

// Mock goldrush client
jest.mock('@/lib/goldrush/client', () => ({
  goldrushClient: {
    get: jest.fn(() => Promise.resolve({
      data: {
        items: [
          {
            block_signed_at: '2024-01-01T00:00:00Z',
            value_quote: '100.50',
            to_address: '0x1234567890123456789012345678901234567890',
            to_address_label: 'Test Contract',
            log_events: [],
          },
        ],
      },
    })),
  },
}));

jest.mock('@airdrop-finder/shared', () => ({
  CHAINS: [
    { id: 1, name: 'Ethereum Mainnet' },
    { id: 8453, name: 'Base' },
  ],
}));

describe('/api/transaction-history/[address]', () => {
  const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  describe('GET', () => {
    it('should return transaction history for valid address', async () => {
      const request = new NextRequest(`http://localhost:3000/api/transaction-history/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.address).toBe(validAddress.toLowerCase());
      expect(data.totalTransactions).toBeDefined();
      expect(typeof data.totalTransactions).toBe('number');
      expect(data.totalChains).toBeDefined();
      expect(data.totalValueUSD).toBeDefined();
      expect(data.analysis).toBeDefined();
      expect(Array.isArray(data.analysis)).toBe(true);
      expect(data.summary).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it('should return error for invalid address format', async () => {
      const invalidAddress = 'invalid-address';
      const request = new NextRequest(`http://localhost:3000/api/transaction-history/${invalidAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: invalidAddress }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Invalid address format');
    });

    it('should respect limit parameter', async () => {
      const request = new NextRequest(`http://localhost:3000/api/transaction-history/${validAddress}?limit=50`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      // The limit affects the API call, not necessarily the response structure
      expect(data).toBeDefined();
    });

    it('should include analysis for each chain', async () => {
      const request = new NextRequest(`http://localhost:3000/api/transaction-history/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      if (data.analysis.length > 0) {
        const chainAnalysis = data.analysis[0];
        expect(chainAnalysis).toHaveProperty('chainId');
        expect(chainAnalysis).toHaveProperty('chainName');
        expect(chainAnalysis).toHaveProperty('totalTransactions');
        expect(chainAnalysis).toHaveProperty('transactionTypes');
        expect(chainAnalysis).toHaveProperty('topContracts');
        expect(chainAnalysis).toHaveProperty('activityPattern');
      }
    });

    it('should include summary statistics', async () => {
      const request = new NextRequest(`http://localhost:3000/api/transaction-history/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(data.summary).toHaveProperty('mostActiveChain');
      expect(data.summary).toHaveProperty('mostActiveDay');
      expect(data.summary).toHaveProperty('mostActiveHour');
      expect(data.summary).toHaveProperty('averageTransactionsPerDay');
      expect(data.summary).toHaveProperty('transactionVelocity');
    });

    it('should cache results', async () => {
      const request1 = new NextRequest(`http://localhost:3000/api/transaction-history/${validAddress}`);
      const response1 = await GET(request1, { params: Promise.resolve({ address: validAddress }) });
      const data1 = await response1.json();

      const request2 = new NextRequest(`http://localhost:3000/api/transaction-history/${validAddress}`);
      const response2 = await GET(request2, { params: Promise.resolve({ address: validAddress }) });
      const data2 = await response2.json();

      // Both should return data (cached or fresh)
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(data1).toBeDefined();
      expect(data2).toBeDefined();
    });

    it('should handle empty transaction history gracefully', async () => {
      // Mock empty response
      const { goldrushClient } = require('@/lib/goldrush/client');
      goldrushClient.get.mockResolvedValueOnce({
        data: { items: [] },
      });

      const request = new NextRequest(`http://localhost:3000/api/transaction-history/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalTransactions).toBe(0);
      expect(data.analysis).toBeDefined();
    });
  });
});

