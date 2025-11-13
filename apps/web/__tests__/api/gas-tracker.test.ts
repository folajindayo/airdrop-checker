/**
 * Tests for /api/gas-tracker/[address] route
 */

import { GET } from '@/app/api/gas-tracker/[address]/route';
import { createAddressRequest, MOCK_ADDRESS } from '../helpers';

describe('/api/gas-tracker/[address]', () => {
  describe('GET', () => {
    it('should get gas tracking data for address', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('address');
      expect(json).toHaveProperty('totalSpent');
      expect(json).toHaveProperty('transactions');
    });

    it('should return validation error for invalid address', async () => {
      const { request, params } = createAddressRequest('invalid-address');

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });

    it('should include gas spending by chain', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      if (json.chains && json.chains.length > 0) {
        const chain = json.chains[0];
        expect(chain).toHaveProperty('chainId');
        expect(chain).toHaveProperty('gasSpent');
      }
    });

    it('should calculate total gas spent', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(typeof json.totalSpent).toBe('number');
      expect(json.totalSpent).toBeGreaterThanOrEqual(0);
    });
  });
});

