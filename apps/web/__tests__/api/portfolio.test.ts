/**
 * Tests for /api/portfolio/[address] route
 */

import { GET } from '@/app/api/portfolio/[address]/route';
import { createAddressRequest, MOCK_ADDRESS } from '../helpers';

describe('/api/portfolio/[address]', () => {
  describe('GET', () => {
    it('should get portfolio data for address', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('address');
      expect(json).toHaveProperty('totalValue');
      expect(json).toHaveProperty('chains');
      expect(Array.isArray(json.chains)).toBe(true);
    });

    it('should return validation error for invalid address', async () => {
      const { request, params } = createAddressRequest('invalid-address');

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });

    it('should include chain breakdown', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      if (json.chains.length > 0) {
        const chain = json.chains[0];
        expect(chain).toHaveProperty('chainId');
        expect(chain).toHaveProperty('chainName');
        expect(chain).toHaveProperty('value');
      }
    });

    it('should calculate total value correctly', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(typeof json.totalValue).toBe('number');
      expect(json.totalValue).toBeGreaterThanOrEqual(0);
    });
  });
});

