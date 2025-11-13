/**
 * Tests for /api/v1/airdrop-check/[address] route
 */

import { GET } from '@/app/api/v1/airdrop-check/[address]/route';
import { createMockRequest, MOCK_ADDRESS } from '../helpers';

describe('/api/v1/airdrop-check/[address]', () => {
  describe('GET', () => {
    it('should check airdrop eligibility via v1 API', async () => {
      const request = createMockRequest(`/api/v1/airdrop-check/${MOCK_ADDRESS}`);
      const params = Promise.resolve({ address: MOCK_ADDRESS });

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('address');
      expect(json).toHaveProperty('overallScore');
    });

    it('should return validation error for invalid address', async () => {
      const request = createMockRequest('/api/v1/airdrop-check/invalid-address');
      const params = Promise.resolve({ address: 'invalid-address' });

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });
  });
});

