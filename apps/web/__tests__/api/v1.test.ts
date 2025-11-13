/**
 * Tests for /api/v1 route
 */

import { GET } from '@/app/api/v1/route';

describe('/api/v1', () => {
  describe('GET', () => {
    it('should return API version information', async () => {
      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('version');
      expect(json).toHaveProperty('status');
      expect(json).toHaveProperty('endpoints');
    });

    it('should return stable status', async () => {
      const response = await GET();
      const json = await response.json();

      expect(json.status).toBe('stable');
    });

    it('should include all endpoint definitions', async () => {
      const response = await GET();
      const json = await response.json();

      expect(json.endpoints).toBeDefined();
      expect(typeof json.endpoints).toBe('object');
    });

    it('should include changelog', async () => {
      const response = await GET();
      const json = await response.json();

      expect(json.changelog).toBeDefined();
      expect(Array.isArray(json.changelog)).toBe(true);
    });
  });
});

