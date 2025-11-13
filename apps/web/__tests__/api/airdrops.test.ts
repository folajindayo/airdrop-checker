/**
 * Tests for /api/airdrops route
 */

import { GET } from '@/app/api/airdrops/route';
import { createMockRequest } from '../helpers';

describe('/api/airdrops', () => {
  describe('GET', () => {
    it('should get list of all airdrops', async () => {
      const request = createMockRequest('/api/airdrops');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(json)).toBe(true);
    });

    it('should return airdrop projects with required fields', async () => {
      const request = createMockRequest('/api/airdrops');

      const response = await GET(request);
      const json = await response.json();

      if (json.length > 0) {
        const project = json[0];
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('name');
        expect(project).toHaveProperty('status');
      }
    });

    it('should include project metadata', async () => {
      const request = createMockRequest('/api/airdrops');

      const response = await GET(request);
      const json = await response.json();

      if (json.length > 0) {
        const project = json[0];
        expect(project).toHaveProperty('chains');
        expect(Array.isArray(project.chains)).toBe(true);
      }
    });
  });
});

