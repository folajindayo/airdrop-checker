/**
 * Tests for /api/v1/airdrops route
 */

import { GET } from '@/app/api/v1/airdrops/route';
import { createMockRequest } from '../helpers';

describe('/api/v1/airdrops', () => {
  describe('GET', () => {
    it('should get airdrops via v1 API', async () => {
      const request = createMockRequest('/api/v1/airdrops');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(json)).toBe(true);
    });

    it('should filter by status query parameter', async () => {
      const request = createMockRequest('/api/v1/airdrops?status=confirmed');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(json)).toBe(true);
    });
  });
});

