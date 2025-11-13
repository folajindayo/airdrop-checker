/**
 * Tests for /api/onchain/block-number route
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/onchain/block-number/route';

// Mock viem
jest.mock('viem', () => ({
  createPublicClient: jest.fn(() => ({
    getBlockNumber: jest.fn(() => Promise.resolve(BigInt(12345678))),
    getBlock: jest.fn(() => Promise.resolve({
      number: BigInt(12345678),
      timestamp: BigInt(1234567890),
      hash: '0x1234567890abcdef',
      transactions: ['0xtx1', '0xtx2'],
    })),
  })),
  http: jest.fn(),
}));

jest.mock('viem/chains', () => ({
  mainnet: { id: 1, name: 'Ethereum Mainnet' },
  base: { id: 8453, name: 'Base' },
  arbitrum: { id: 42161, name: 'Arbitrum One' },
  optimism: { id: 10, name: 'Optimism' },
  polygon: { id: 137, name: 'Polygon' },
}));

describe('/api/onchain/block-number', () => {
  describe('GET', () => {
    it('should return block number for default chain (mainnet)', async () => {
      const request = new NextRequest('http://localhost:3000/api/onchain/block-number');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.chainId).toBe(1);
      expect(data.chainName).toBeDefined();
      expect(data.blockNumber).toBeDefined();
      expect(data.blockTimestamp).toBeDefined();
      expect(data.blockHash).toBeDefined();
      expect(data.transactionCount).toBeDefined();
      expect(data.type).toBe('block_number');
    });

    it('should return block number for specified chain', async () => {
      const request = new NextRequest('http://localhost:3000/api/onchain/block-number?chainId=8453');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.chainId).toBe(8453);
      expect(data.chainName).toBeDefined();
      expect(data.blockNumber).toBeDefined();
    });

    it('should return block number for arbitrum', async () => {
      const request = new NextRequest('http://localhost:3000/api/onchain/block-number?chainId=42161');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.chainId).toBe(42161);
    });

    it('should return block number for optimism', async () => {
      const request = new NextRequest('http://localhost:3000/api/onchain/block-number?chainId=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.chainId).toBe(10);
    });

    it('should return block number for polygon', async () => {
      const request = new NextRequest('http://localhost:3000/api/onchain/block-number?chainId=137');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.chainId).toBe(137);
    });

    it('should return error for unsupported chain', async () => {
      const request = new NextRequest('http://localhost:3000/api/onchain/block-number?chainId=999');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Unsupported chain ID');
    });

    it('should include all required fields in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/onchain/block-number');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('chainId');
      expect(data).toHaveProperty('chainName');
      expect(data).toHaveProperty('blockNumber');
      expect(data).toHaveProperty('blockTimestamp');
      expect(data).toHaveProperty('blockHash');
      expect(data).toHaveProperty('transactionCount');
      expect(data).toHaveProperty('type');
    });
  });
});

