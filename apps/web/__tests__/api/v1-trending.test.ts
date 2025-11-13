/**
 * Tests for /api/v1/trending route
 */

import { GET } from '@/app/api/v1/trending/route';
import { createMockRequest } from '../helpers';

describe('/api/v1/trending', () => {
  describe('GET', () => {
    it('should get trending airdrops via v1 API', async () => {
      const request = createMockRequest('/api/v1/trending');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(json)).toBe(true);
    });

    it('should return trending projects with scores', async () => {
      const request = createMockRequest('/api/v1/trending');

      const response = await GET(request);
      const json = await response.json();

      if (json.length > 0) {
        const project = json[0];
        expect(project).toHaveProperty('projectId');
        expect(project).toHaveProperty('trendingScore');
      }
    });
  });
});

