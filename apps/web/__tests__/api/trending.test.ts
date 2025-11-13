/**
 * Tests for /api/trending route
 */

import { GET } from '@/app/api/trending/route';
import { createMockRequest } from '../helpers';

describe('/api/trending', () => {
  describe('GET', () => {
    it('should get trending airdrops', async () => {
      const request = createMockRequest('/api/trending');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(json)).toBe(true);
    });

    it('should return trending projects with scores', async () => {
      const request = createMockRequest('/api/trending');

      const response = await GET(request);
      const json = await response.json();

      if (json.length > 0) {
        const project = json[0];
        expect(project).toHaveProperty('projectId');
        expect(project).toHaveProperty('trendingScore');
        expect(typeof project.trendingScore).toBe('number');
      }
    });

    it('should sort by trending score', async () => {
      const request = createMockRequest('/api/trending');

      const response = await GET(request);
      const json = await response.json();

      if (json.length > 1) {
        for (let i = 0; i < json.length - 1; i++) {
          expect(json[i].trendingScore).toBeGreaterThanOrEqual(json[i + 1].trendingScore);
        }
      }
    });
  });
});

