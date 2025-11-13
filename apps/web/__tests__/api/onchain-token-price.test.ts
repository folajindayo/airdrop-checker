/**
 * Tests for /api/onchain/token-price route
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/onchain/token-price/route';

// Mock viem
jest.mock('viem', () => ({
  createPublicClient: jest.fn(() => ({
    readContract: jest.fn(() => Promise.resolve([
      BigInt('1000000000000000000'), // token0 reserve
      BigInt('2000000000000000000'), // token1 reserve
      BigInt(1234567890), // timestamp
    ])),
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

describe('/api/onchain/token-price', () => {
  describe('GET', () => {
    const validTokenAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
    const validPairAddress = '0x1234567890123456789012345678901234567890';

    it('should return token price with required parameters', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/onchain/token-price?tokenAddress=${validTokenAddress}&pairAddress=${validPairAddress}`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.tokenAddress).toBe(validTokenAddress);
      expect(data.pairAddress).toBe(validPairAddress);
      expect(data.chainId).toBe(1); // Default chain
      expect(data.reserves).toBeDefined();
      expect(data.estimatedPrice).toBeDefined();
      expect(data.priceUSD).toBeDefined();
      expect(data.type).toBe('token_price');
      expect(data.note).toBeDefined();
    });

    it('should return token price for specified chain', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/onchain/token-price?tokenAddress=${validTokenAddress}&pairAddress=${validPairAddress}&chainId=8453`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.chainId).toBe(8453);
    });

    it('should return error when tokenAddress is missing', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/onchain/token-price?pairAddress=${validPairAddress}`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Missing required parameters');
    });

    it('should return error when pairAddress is missing', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/onchain/token-price?tokenAddress=${validTokenAddress}`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Missing required parameters');
    });

    it('should return error for unsupported chain', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/onchain/token-price?tokenAddress=${validTokenAddress}&pairAddress=${validPairAddress}&chainId=999`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Unsupported chain ID');
    });

    it('should include reserves in response', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/onchain/token-price?tokenAddress=${validTokenAddress}&pairAddress=${validPairAddress}`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.reserves).toBeDefined();
      expect(data.reserves.token0).toBeDefined();
      expect(data.reserves.token1).toBeDefined();
    });

    it('should calculate price from reserves', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/onchain/token-price?tokenAddress=${validTokenAddress}&pairAddress=${validPairAddress}`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.estimatedPrice).toBeDefined();
      expect(typeof data.estimatedPrice).toBe('string');
      expect(parseFloat(data.estimatedPrice)).toBeGreaterThan(0);
    });
  });
});

