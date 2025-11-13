/**
 * Tests for /api/airdrops/highlights route
 */

import { GET } from '@/app/api/airdrops/highlights/route';
import { createMockRequest } from '../helpers';

describe('/api/airdrops/highlights', () => {
  describe('GET', () => {
    it('should get highlighted airdrops', async () => {
      const request = createMockRequest('/api/airdrops/highlights');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(json)).toBe(true);
    });

    it('should return highlighted projects with required fields', async () => {
      const request = createMockRequest('/api/airdrops/highlights');

      const response = await GET(request);
      const json = await response.json();

      if (json.length > 0) {
        const project = json[0];
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('name');
        expect(project).toHaveProperty('status');
      }
    });
  });
});

