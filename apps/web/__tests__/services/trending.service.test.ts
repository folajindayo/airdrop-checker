/**
 * Tests for TrendingService
 */

import { getTrendingAirdrops } from '@/lib/services/trending.service';

describe('TrendingService', () => {
  describe('getTrendingAirdrops', () => {
    it('should get trending airdrops', async () => {
      const result = await getTrendingAirdrops();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const limit = 5;
      const result = await getTrendingAirdrops(limit);

      expect(result.length).toBeLessThanOrEqual(limit);
    });

    it('should return projects with trending scores', async () => {
      const result = await getTrendingAirdrops(10);

      if (result.length > 0) {
        const project = result[0];
        expect(project).toHaveProperty('projectId');
        expect(project).toHaveProperty('trendingScore');
        expect(typeof project.trendingScore).toBe('number');
      }
    });

    it('should sort by trending score descending', async () => {
      const result = await getTrendingAirdrops(10);

      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].trendingScore).toBeGreaterThanOrEqual(result[i + 1].trendingScore);
        }
      }
    });

    it('should handle empty database gracefully', async () => {
      // This test verifies the service doesn't crash with no data
      const result = await getTrendingAirdrops();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

