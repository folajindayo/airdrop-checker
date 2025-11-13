/**
 * Tests for /api/v1/portfolio/[address] route
 */

import { GET } from '@/app/api/v1/portfolio/[address]/route';
import { createMockRequest, MOCK_ADDRESS } from '../helpers';

describe('/api/v1/portfolio/[address]', () => {
  describe('GET', () => {
    it('should get portfolio data via v1 API', async () => {
      const request = createMockRequest(`/api/v1/portfolio/${MOCK_ADDRESS}`);
      const params = Promise.resolve({ address: MOCK_ADDRESS });

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('address');
      expect(json).toHaveProperty('totalValue');
    });

    it('should return validation error for invalid address', async () => {
      const request = createMockRequest('/api/v1/portfolio/invalid-address');
      const params = Promise.resolve({ address: 'invalid-address' });

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });
  });
});

