/**
 * Tests for /api/wallet-health/[address] route
 */

import { GET } from '@/app/api/wallet-health/[address]/route';
import { createMockRequest, MOCK_ADDRESS } from '../helpers';

describe('/api/wallet-health/[address]', () => {
  describe('GET', () => {
    it('should get wallet health data for address', async () => {
      const request = createMockRequest(`/api/wallet-health/${MOCK_ADDRESS}`);
      const params = { address: MOCK_ADDRESS };

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('address');
      expect(json).toHaveProperty('healthScore');
    });

    it('should return validation error for invalid address', async () => {
      const request = createMockRequest('/api/wallet-health/invalid-address');
      const params = { address: 'invalid-address' };

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });

    it('should include health score with overall score', async () => {
      const request = createMockRequest(`/api/wallet-health/${MOCK_ADDRESS}`);
      const params = { address: MOCK_ADDRESS };

      const response = await GET(request, params);
      const json = await response.json();

      expect(json.healthScore).toBeDefined();
      expect(json.healthScore).toHaveProperty('overall');
      expect(typeof json.healthScore.overall).toBe('number');
    });

    it('should include metrics', async () => {
      const request = createMockRequest(`/api/wallet-health/${MOCK_ADDRESS}`);
      const params = { address: MOCK_ADDRESS };

      const response = await GET(request, params);
      const json = await response.json();

      expect(json.healthScore).toHaveProperty('metrics');
      expect(Array.isArray(json.healthScore.metrics)).toBe(true);
    });

    it('should include recommendations', async () => {
      const request = createMockRequest(`/api/wallet-health/${MOCK_ADDRESS}`);
      const params = { address: MOCK_ADDRESS };

      const response = await GET(request, params);
      const json = await response.json();

      expect(json).toHaveProperty('recommendations');
      expect(Array.isArray(json.recommendations)).toBe(true);
    });
  });
});

