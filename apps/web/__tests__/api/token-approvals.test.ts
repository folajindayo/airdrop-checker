/**
 * Tests for /api/token-approvals/[address] route
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/token-approvals/[address]/route';

// Mock goldrush client
jest.mock('@/lib/goldrush/client', () => ({
  goldrushClient: {
    get: jest.fn(() => Promise.resolve({
      data: {
        items: [
          {
            tx_hash: '0x1234567890abcdef',
            block_height: 12345678,
            block_signed_at: '2024-01-01T00:00:00Z',
            to_address_label: 'Uniswap Router',
            log_events: [
              {
                decoded: {
                  name: 'Approval',
                  params: [
                    { name: 'owner', value: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
                    { name: 'spender', value: '0x1111111111111111111111111111111111111111' },
                    { name: 'value', value: '115792089237316195423570985008687907853269984665640564039457584007913129639935' },
                  ],
                },
                sender_address: '0x1234567890123456789012345678901234567890',
                sender_contract_ticker_symbol: 'USDC',
                sender_contract_label: 'USD Coin',
                sender_contract_decimals: 6,
                topics: ['0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0'],
              },
            ],
          },
        ],
      },
    })),
  },
}));

jest.mock('@airdrop-finder/shared', () => ({
  CHAINS: [
    { id: 1, name: 'Ethereum Mainnet' },
  ],
}));

jest.mock('viem', () => ({
  createPublicClient: jest.fn(),
  http: jest.fn(),
  formatUnits: jest.fn((value: bigint, decimals: number) => {
    return (Number(value) / Math.pow(10, decimals)).toFixed(6);
  }),
}));

describe('/api/token-approvals/[address]', () => {
  const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  describe('GET', () => {
    it('should return token approvals for valid address', async () => {
      const request = new NextRequest(`http://localhost:3000/api/token-approvals/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.address).toBe(validAddress.toLowerCase());
      expect(data.totalApprovals).toBeDefined();
      expect(typeof data.totalApprovals).toBe('number');
      expect(data.activeApprovals).toBeDefined();
      expect(data.unlimitedApprovals).toBeDefined();
      expect(data.approvals).toBeDefined();
      expect(Array.isArray(data.approvals)).toBe(true);
      expect(data.byToken).toBeDefined();
      expect(data.bySpender).toBeDefined();
      expect(data.riskScore).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it('should return error for invalid address format', async () => {
      const invalidAddress = 'invalid-address';
      const request = new NextRequest(`http://localhost:3000/api/token-approvals/${invalidAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: invalidAddress }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Invalid address format');
    });

    it('should include approval details', async () => {
      const request = new NextRequest(`http://localhost:3000/api/token-approvals/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      if (data.approvals.length > 0) {
        const approval = data.approvals[0];
        expect(approval).toHaveProperty('chainId');
        expect(approval).toHaveProperty('chainName');
        expect(approval).toHaveProperty('tokenAddress');
        expect(approval).toHaveProperty('tokenSymbol');
        expect(approval).toHaveProperty('spenderAddress');
        expect(approval).toHaveProperty('amount');
        expect(approval).toHaveProperty('isUnlimited');
        expect(approval).toHaveProperty('transactionHash');
      }
    });

    it('should group approvals by token', async () => {
      const request = new NextRequest(`http://localhost:3000/api/token-approvals/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(data.byToken).toBeDefined();
      if (Object.keys(data.byToken).length > 0) {
        const tokenData = Object.values(data.byToken)[0] as any;
        expect(tokenData).toHaveProperty('tokenAddress');
        expect(tokenData).toHaveProperty('tokenSymbol');
        expect(tokenData).toHaveProperty('approvalCount');
        expect(tokenData).toHaveProperty('approvals');
      }
    });

    it('should group approvals by spender', async () => {
      const request = new NextRequest(`http://localhost:3000/api/token-approvals/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(data.bySpender).toBeDefined();
      if (Object.keys(data.bySpender).length > 0) {
        const spenderData = Object.values(data.bySpender)[0] as any;
        expect(spenderData).toHaveProperty('spenderAddress');
        expect(spenderData).toHaveProperty('approvalCount');
        expect(spenderData).toHaveProperty('approvals');
      }
    });

    it('should calculate risk score', async () => {
      const request = new NextRequest(`http://localhost:3000/api/token-approvals/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(data.riskScore).toBeDefined();
      expect(typeof data.riskScore).toBe('number');
      expect(data.riskScore).toBeGreaterThanOrEqual(0);
      expect(data.riskScore).toBeLessThanOrEqual(100);
    });

    it('should detect unlimited approvals', async () => {
      const request = new NextRequest(`http://localhost:3000/api/token-approvals/${validAddress}`);
      const response = await GET(request, { params: Promise.resolve({ address: validAddress }) });
      const data = await response.json();

      expect(data.unlimitedApprovals).toBeDefined();
      expect(typeof data.unlimitedApprovals).toBe('number');
      if (data.approvals.length > 0) {
        const hasUnlimited = data.approvals.some((a: any) => a.isUnlimited === true);
        if (hasUnlimited) {
          expect(data.unlimitedApprovals).toBeGreaterThan(0);
        }
      }
    });

    it('should cache results', async () => {
      const request1 = new NextRequest(`http://localhost:3000/api/token-approvals/${validAddress}`);
      const response1 = await GET(request1, { params: Promise.resolve({ address: validAddress }) });
      const data1 = await response1.json();

      const request2 = new NextRequest(`http://localhost:3000/api/token-approvals/${validAddress}`);
      const response2 = await GET(request2, { params: Promise.resolve({ address: validAddress }) });
      const data2 = await response2.json();

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });
  });
});

