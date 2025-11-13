/**
 * Tests for /api/health route
 */

import { GET } from '@/app/api/health/route';
import { createMockRequest } from '../helpers';

describe('/api/health', () => {
  describe('GET', () => {
    it('should return health status', async () => {
      const request = createMockRequest('/api/health');

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('status');
      expect(json).toHaveProperty('timestamp');
    });

    it('should return healthy status', async () => {
      const request = createMockRequest('/api/health');

      const response = await GET();
      const json = await response.json();

      expect(json.status).toBe('healthy');
    });
  });
});

