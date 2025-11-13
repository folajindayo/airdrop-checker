/**
 * Tests for /api/airdrop-check/[address] route
 */

import { GET } from '@/app/api/airdrop-check/[address]/route';
import { createAddressRequest, MOCK_ADDRESS } from '../helpers';

describe('/api/airdrop-check/[address]', () => {
  describe('GET', () => {
    it('should check airdrop eligibility for address', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('address');
      expect(json).toHaveProperty('overallScore');
      expect(json).toHaveProperty('airdrops');
      expect(Array.isArray(json.airdrops)).toBe(true);
    });

    it('should return validation error for invalid address', async () => {
      const { request, params } = createAddressRequest('invalid-address');

      const response = await GET(request, params);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error');
    });

    it('should include eligibility scores', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      expect(typeof json.overallScore).toBe('number');
      expect(json.overallScore).toBeGreaterThanOrEqual(0);
      expect(json.overallScore).toBeLessThanOrEqual(100);
    });

    it('should include project details in airdrops', async () => {
      const { request, params } = createAddressRequest(MOCK_ADDRESS);

      const response = await GET(request, params);
      const json = await response.json();

      if (json.airdrops.length > 0) {
        const airdrop = json.airdrops[0];
        expect(airdrop).toHaveProperty('project');
        expect(airdrop).toHaveProperty('projectId');
        expect(airdrop).toHaveProperty('status');
        expect(airdrop).toHaveProperty('score');
      }
    });
  });
});

