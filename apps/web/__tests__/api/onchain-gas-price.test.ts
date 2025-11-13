/**
 * Tests for /api/onchain/gas-price route
 */

import { GET } from '@/app/api/onchain/gas-price/route';
import { createMockRequest } from '../helpers';

describe('/api/onchain/gas-price', () => {
  describe('GET', () => {
    it('should get gas price data', async () => {
      const request = createMockRequest('/api/onchain/gas-price');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toBeDefined();
    });

    it('should include chainId parameter', async () => {
      const request = createMockRequest('/api/onchain/gas-price?chainId=1');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
    });
  });
});

