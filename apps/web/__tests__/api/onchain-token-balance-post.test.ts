/**
 * Tests for /api/onchain/token-balance route (POST)
 */

import { POST } from '@/app/api/onchain/token-balance/route';
import { createMockRequestWithBody, MOCK_ADDRESS } from '../helpers';

describe('/api/onchain/token-balance', () => {
  describe('POST', () => {
    it('should get token balance with POST request', async () => {
      const request = createMockRequestWithBody('/api/onchain/token-balance', {
        address: MOCK_ADDRESS,
        chainId: 1,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('address');
    });

    it('should return validation error for missing address', async () => {
      const request = createMockRequestWithBody('/api/onchain/token-balance', {
        chainId: 1,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });

    it('should return validation error for invalid address', async () => {
      const request = createMockRequestWithBody('/api/onchain/token-balance', {
        address: 'invalid-address',
        chainId: 1,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });
  });
});

