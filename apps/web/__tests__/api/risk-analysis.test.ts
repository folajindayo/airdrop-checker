/**
 * Tests for /api/risk-analysis/[address] route
 */

import { GET } from '@/app/api/risk-analysis/[address]/route';
import { createAddressRequest, MOCK_ADDRESS } from '../helpers';

describe('/api/risk-analysis/[address]', () => {
  describe('GET', () => {
    it('should get risk analysis for address', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('address');
      expect(json).toHaveProperty('riskScore');
      expect(json).toHaveProperty('tokenApprovals');
    });

    it('should return validation error for invalid address', async () => {
      const { request, params } = createAddressRequest('invalid-address');

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });

    it('should include risk score between 0 and 100', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(typeof json.riskScore).toBe('number');
      expect(json.riskScore).toBeGreaterThanOrEqual(0);
      expect(json.riskScore).toBeLessThanOrEqual(100);
    });

    it('should include token approvals array', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(Array.isArray(json.tokenApprovals)).toBe(true);
    });

    it('should include security recommendations', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(json).toHaveProperty('recommendations');
      expect(Array.isArray(json.recommendations)).toBe(true);
    });
  });
});

