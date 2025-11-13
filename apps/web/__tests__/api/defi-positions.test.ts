/**
 * Tests for /api/defi-positions/[address] route
 */

import { GET } from '@/app/api/defi-positions/[address]/route';
import { createMockRequest, MOCK_ADDRESS } from '../helpers';

describe('/api/defi-positions/[address]', () => {
  describe('GET', () => {
    it('should get DeFi positions for address', async () => {
      const request = createMockRequest(`/api/defi-positions/${MOCK_ADDRESS}`);
      const params = { address: MOCK_ADDRESS };

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('address');
      expect(json).toHaveProperty('totalValue');
    });

    it('should return validation error for invalid address', async () => {
      const request = createMockRequest('/api/defi-positions/invalid-address');
      const params = { address: 'invalid-address' };

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });

    it('should include lending positions', async () => {
      const request = createMockRequest(`/api/defi-positions/${MOCK_ADDRESS}`);
      const params = { address: MOCK_ADDRESS };

      const response = await GET(request, params);
      const json = await response.json();

      expect(json).toHaveProperty('lending');
      expect(Array.isArray(json.lending)).toBe(true);
    });

    it('should include staking positions', async () => {
      const request = createMockRequest(`/api/defi-positions/${MOCK_ADDRESS}`);
      const params = { address: MOCK_ADDRESS };

      const response = await GET(request, params);
      const json = await response.json();

      expect(json).toHaveProperty('staking');
      expect(Array.isArray(json.staking)).toBe(true);
    });

    it('should include liquidity pool positions', async () => {
      const request = createMockRequest(`/api/defi-positions/${MOCK_ADDRESS}`);
      const params = { address: MOCK_ADDRESS };

      const response = await GET(request, params);
      const json = await response.json();

      expect(json).toHaveProperty('liquidityPools');
      expect(Array.isArray(json.liquidityPools)).toBe(true);
    });
  });
});

