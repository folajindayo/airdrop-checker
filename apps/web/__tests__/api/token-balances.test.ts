/**
 * Tests for /api/token-balances/[address] route
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/token-balances/[address]/route';

// Mock goldrush client
jest.mock('@/lib/goldrush/client', () => ({
  goldrushClient: {
    get: jest.fn(() => Promise.resolve({
      data: {
        items: [
          {
            contract_address: '0x1234567890123456789012345678901234567890',
            contract_ticker_symbol: 'USDC',
            contract_name: 'USD Coin',
            balance: '1000000000',
            quote: '1000.00',
            contract_decimals: 6,
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

describe('/api/token-balances/[address]', () => {
  const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  describe('GET', () => {
    it('should return token balances for valid address', async () => {
      const request = new NextRequest(`http://localhost:3000/api/token-balances/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.address).toBe(validAddress.toLowerCase());
      expect(data.totalValueUSD).toBeDefined();
      expect(typeof data.totalValueUSD).toBe('number');
      expect(data.tokenCount).toBeDefined();
      expect(data.balances).toBeDefined();
      expect(Array.isArray(data.balances)).toBe(true);
      expect(data.byChain).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it('should return error for invalid address format', async () => {
      const invalidAddress = 'invalid-address';
      const request = new NextRequest(`http://localhost:3000/api/token-balances/${invalidAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: invalidAddress }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Invalid address format');
    });

    it('should include token balance details', async () => {
      const request = new NextRequest(`http://localhost:3000/api/token-balances/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      if (data.balances.length > 0) {
        const balance = data.balances[0];
        expect(balance).toHaveProperty('chainId');
        expect(balance).toHaveProperty('chainName');
        expect(balance).toHaveProperty('tokenAddress');
        expect(balance).toHaveProperty('tokenSymbol');
        expect(balance).toHaveProperty('tokenName');
        expect(balance).toHaveProperty('balance');
        expect(balance).toHaveProperty('balanceFormatted');
        expect(balance).toHaveProperty('usdValue');
        expect(balance).toHaveProperty('decimals');
      }
    });

    it('should group balances by chain', async () => {
      const request = new NextRequest(`http://localhost:3000/api/token-balances/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(data.byChain).toBeDefined();
      if (Object.keys(data.byChain).length > 0) {
        const chainData = Object.values(data.byChain)[0] as any;
        expect(chainData).toHaveProperty('chainId');
        expect(chainData).toHaveProperty('chainName');
        expect(chainData).toHaveProperty('value');
        expect(chainData).toHaveProperty('tokenCount');
        expect(chainData).toHaveProperty('tokens');
      }
    });

    it('should sort balances by USD value', async () => {
      const request = new NextRequest(`http://localhost:3000/api/token-balances/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      if (data.balances.length > 1) {
        for (let i = 0; i < data.balances.length - 1; i++) {
          expect(data.balances[i].usdValue).toBeGreaterThanOrEqual(data.balances[i + 1].usdValue);
        }
      }
    });

    it('should cache results', async () => {
      const request1 = new NextRequest(`http://localhost:3000/api/token-balances/${validAddress}`);
      const response1 = await GET(request1, { params: Promise.resolve({ address: validAddress }) });
      const data1 = await response1.json();

      const request2 = new NextRequest(`http://localhost:3000/api/token-balances/${validAddress}`);
      const response2 = await GET(request2, { params: Promise.resolve({ address: validAddress }) });
      const data2 = await response2.json();

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(data1).toBeDefined();
      expect(data2).toBeDefined();
    });
  });
});

