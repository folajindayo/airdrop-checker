/**
 * Tests for /api/onchain/token-balance/[address] route
 */

import { GET } from '@/app/api/onchain/token-balance/[address]/route';
import { createAddressRequest, MOCK_ADDRESS } from '../helpers';

describe('/api/onchain/token-balance/[address]', () => {
  describe('GET', () => {
    it('should get token balance for address', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('address');
      expect(json).toHaveProperty('balances');
    });

    it('should return validation error for invalid address', async () => {
      const { request, params } = createAddressRequest('invalid-address');

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });

    it('should include token balances array', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(Array.isArray(json.balances)).toBe(true);
    });
  });
});

