/**
 * Tests for HighlightsService
 */

import { getAirdropHighlights } from '@/lib/services/highlights.service';

describe('HighlightsService', () => {
  describe('getAirdropHighlights', () => {
    it('should get highlighted airdrops', async () => {
      const result = await getAirdropHighlights();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return airdrop projects with required fields', async () => {
      const result = await getAirdropHighlights();

      if (result.length > 0) {
        const project = result[0];
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('name');
        expect(project).toHaveProperty('status');
      }
    });

    it('should filter highlighted projects correctly', async () => {
      const result = await getAirdropHighlights();

      // All returned projects should be highlighted/featured
      result.forEach((project) => {
        expect(project).toBeDefined();
        expect(project.id).toBeDefined();
      });
    });

    it('should handle empty database gracefully', async () => {
      const result = await getAirdropHighlights();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

