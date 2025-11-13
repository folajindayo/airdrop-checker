/**
 * Tests for /api/nft-collections/[address] route
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/nft-collections/[address]/route';

// Mock goldrush client
jest.mock('@/lib/goldrush/client', () => ({
  goldrushClient: {
    get: jest.fn(() => Promise.resolve({
      data: {
        items: [
          {
            type: 'nft',
            contract_address: '0x1234567890123456789012345678901234567890',
            contract_name: 'Test NFT Collection',
            contract_ticker_symbol: 'TEST',
            supports_erc: 'ERC-721',
            total_supply: 10000,
            balance: '5',
            quote: '100.50',
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

describe('/api/nft-collections/[address]', () => {
  const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  describe('GET', () => {
    it('should return NFT collections for valid address', async () => {
      const request = new NextRequest(`http://localhost:3000/api/nft-collections/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.address).toBe(validAddress.toLowerCase());
      expect(data.totalNFTs).toBeDefined();
      expect(typeof data.totalNFTs).toBe('number');
      expect(data.totalCollections).toBeDefined();
      expect(data.totalValueUSD).toBeDefined();
      expect(data.collections).toBeDefined();
      expect(Array.isArray(data.collections)).toBe(true);
      expect(data.byChain).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it('should return error for invalid address format', async () => {
      const invalidAddress = 'invalid-address';
      const request = new NextRequest(`http://localhost:3000/api/nft-collections/${invalidAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: invalidAddress }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Invalid address format');
    });

    it('should include collection details', async () => {
      const request = new NextRequest(`http://localhost:3000/api/nft-collections/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      if (data.collections.length > 0) {
        const collection = data.collections[0];
        expect(collection).toHaveProperty('chainId');
        expect(collection).toHaveProperty('chainName');
        expect(collection).toHaveProperty('contractAddress');
        expect(collection).toHaveProperty('contractName');
        expect(collection).toHaveProperty('tokenType');
        expect(collection).toHaveProperty('nftCount');
      }
    });

    it('should group collections by chain', async () => {
      const request = new NextRequest(`http://localhost:3000/api/nft-collections/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(data.byChain).toBeDefined();
      if (Object.keys(data.byChain).length > 0) {
        const chainData = Object.values(data.byChain)[0] as any;
        expect(chainData).toHaveProperty('chainId');
        expect(chainData).toHaveProperty('chainName');
        expect(chainData).toHaveProperty('nftCount');
        expect(chainData).toHaveProperty('collectionCount');
        expect(chainData).toHaveProperty('collections');
      }
    });

    it('should sort collections by value', async () => {
      const request = new NextRequest(`http://localhost:3000/api/nft-collections/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      if (data.collections.length > 1) {
        for (let i = 0; i < data.collections.length - 1; i++) {
          const current = data.collections[i].totalValueUSD || 0;
          const next = data.collections[i + 1].totalValueUSD || 0;
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });

    it('should cache results', async () => {
      const request1 = new NextRequest(`http://localhost:3000/api/nft-collections/${validAddress}`);
      const response1 = await GET(request1, { params: Promise.resolve({ address: validAddress }) });
      const data1 = await response1.json();

      const request2 = new NextRequest(`http://localhost:3000/api/nft-collections/${validAddress}`);
      const response2 = await GET(request2, { params: Promise.resolve({ address: validAddress }) });
      const data2 = await response2.json();

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });
  });
});

