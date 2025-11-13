/**
 * Comprehensive tests for /api/airdrops route
 * Tests filtering, caching, sorting, and error handling
 */

import { GET } from '@/app/api/airdrops/route';
import { createMockRequest } from '../helpers';
import { cache } from '@airdrop-finder/shared';

describe('/api/airdrops', () => {
  beforeEach(() => {
    // Clear cache before each test
    cache.clear();
  });

  describe('GET - Success Cases', () => {
    it('should get list of all airdrops', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('projects');
      expect(json).toHaveProperty('count');
      expect(Array.isArray(json.projects)).toBe(true);
      expect(json.count).toBe(json.projects.length);
    });

    it('should return airdrop projects with required fields', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops');

      const response = await GET(request);
      const json = await response.json();

      if (json.projects.length > 0) {
        const project = json.projects[0];
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('name');
        expect(project).toHaveProperty('slug');
        expect(project).toHaveProperty('status');
        expect(project).toHaveProperty('description');
      }
    });

    it('should include project metadata', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops');

      const response = await GET(request);
      const json = await response.json();

      if (json.projects.length > 0) {
        const project = json.projects[0];
        expect(project).toHaveProperty('chains');
        expect(Array.isArray(project.chains)).toBe(true);
        expect(project).toHaveProperty('tags');
        expect(Array.isArray(project.tags)).toBe(true);
      }
    });

    it('should include criteria for each project', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops');

      const response = await GET(request);
      const json = await response.json();

      if (json.projects.length > 0) {
        const project = json.projects[0];
        expect(project).toHaveProperty('criteria');
        expect(Array.isArray(project.criteria)).toBe(true);
      }
    });

    it('should sort projects by status priority', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops');

      const response = await GET(request);
      const json = await response.json();

      if (json.projects.length > 1) {
        const statusPriority: Record<string, number> = {
          confirmed: 4,
          rumored: 3,
          speculative: 2,
          expired: 1,
        };

        let isSorted = true;
        for (let i = 1; i < json.projects.length; i++) {
          const prevPriority = statusPriority[json.projects[i - 1].status];
          const currPriority = statusPriority[json.projects[i].status];
          
          if (currPriority > prevPriority) {
            isSorted = false;
            break;
          }
        }

        expect(isSorted).toBe(true);
      }
    });
  });

  describe('GET - Status Filtering', () => {
    it('should filter airdrops by confirmed status', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops?status=confirmed');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(json.projects)).toBe(true);

      if (json.projects.length > 0) {
        json.projects.forEach((project: any) => {
          expect(project.status).toBe('confirmed');
        });
      }
    });

    it('should filter airdrops by rumored status', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops?status=rumored');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(json.projects)).toBe(true);

      if (json.projects.length > 0) {
        json.projects.forEach((project: any) => {
          expect(project.status).toBe('rumored');
        });
      }
    });

    it('should filter airdrops by speculative status', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops?status=speculative');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(json.projects)).toBe(true);

      if (json.projects.length > 0) {
        json.projects.forEach((project: any) => {
          expect(project.status).toBe('speculative');
        });
      }
    });

    it('should filter airdrops by expired status', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops?status=expired');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(json.projects)).toBe(true);

      if (json.projects.length > 0) {
        json.projects.forEach((project: any) => {
          expect(project.status).toBe('expired');
        });
      }
    });

    it('should return all airdrops when no status filter provided', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.projects.length).toBeGreaterThan(0);
    });
  });

  describe('GET - Caching Behavior', () => {
    it('should cache successful responses', async () => {
      const request1 = createMockRequest('http://localhost:3000/api/airdrops');

      // First request - should not be cached
      const response1 = await GET(request1);
      const json1 = await response1.json();
      expect(json1.cached).toBeFalsy();

      // Second request - should be cached
      const request2 = createMockRequest('http://localhost:3000/api/airdrops');
      const response2 = await GET(request2);
      const json2 = await response2.json();
      expect(json2.cached).toBe(true);
    });

    it('should cache different status filters separately', async () => {
      const requestAll = createMockRequest('http://localhost:3000/api/airdrops');
      const responseAll = await GET(requestAll);
      const jsonAll = await responseAll.json();

      const requestConfirmed = createMockRequest('http://localhost:3000/api/airdrops?status=confirmed');
      const responseConfirmed = await GET(requestConfirmed);
      const jsonConfirmed = await responseConfirmed.json();

      // Both should be fresh (not cached from each other)
      expect(jsonAll.cached).toBeFalsy();
      expect(jsonConfirmed.cached).toBeFalsy();
    });

    it('should use cache for subsequent identical requests', async () => {
      const request1 = createMockRequest('http://localhost:3000/api/airdrops?status=confirmed');
      await GET(request1);

      const startTime = Date.now();
      const request2 = createMockRequest('http://localhost:3000/api/airdrops?status=confirmed');
      const response2 = await GET(request2);
      const endTime = Date.now();

      // Cached response should be fast (< 50ms)
      expect(endTime - startTime).toBeLessThan(50);
      
      const json2 = await response2.json();
      expect(json2.cached).toBe(true);
    });
  });

  describe('GET - Response Format', () => {
    it('should return proper JSON content type', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops');

      const response = await GET(request);
      const contentType = response.headers.get('content-type');

      expect(contentType).toContain('application/json');
    });

    it('should include count field in response', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops');

      const response = await GET(request);
      const json = await response.json();

      expect(json).toHaveProperty('count');
      expect(typeof json.count).toBe('number');
      expect(json.count).toBeGreaterThanOrEqual(0);
    });

    it('should have consistent project structure', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops');

      const response = await GET(request);
      const json = await response.json();

      if (json.projects.length > 1) {
        const firstProject = json.projects[0];
        const secondProject = json.projects[1];

        // Both should have the same keys
        expect(Object.keys(firstProject).sort()).toEqual(
          Object.keys(secondProject).sort()
        );
      }
    });
  });

  describe('GET - Edge Cases', () => {
    it('should handle invalid status filter gracefully', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops?status=invalid');

      const response = await GET(request);

      // Should not crash, returns all or empty
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    it('should handle empty result set', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops?status=nonexistent');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(Array.isArray(json.projects)).toBe(true);
    });

    it('should handle multiple query parameters', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops?status=confirmed&extra=param');

      const response = await GET(request);

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('GET - Performance', () => {
    it('should respond within acceptable time (uncached)', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops');

      const startTime = Date.now();
      const response = await GET(request);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      // Should respond within 2 seconds for uncached request
      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should respond quickly for cached requests', async () => {
      // Prime the cache
      const request1 = createMockRequest('http://localhost:3000/api/airdrops');
      await GET(request1);

      // Test cached response time
      const request2 = createMockRequest('http://localhost:3000/api/airdrops');
      const startTime = Date.now();
      const response = await GET(request2);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      // Cached response should be very fast (< 50ms)
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should handle large result sets efficiently', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops');

      const startTime = Date.now();
      const response = await GET(request);
      const json = await response.json();
      const endTime = Date.now();

      expect(response.status).toBe(200);
      // Should handle any size efficiently
      if (json.projects.length > 50) {
        expect(endTime - startTime).toBeLessThan(3000);
      }
    });
  });

  describe('GET - Data Integrity', () => {
    it('should have unique project IDs', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops');

      const response = await GET(request);
      const json = await response.json();

      const ids = json.projects.map((p: any) => p.id);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have unique project slugs', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops');

      const response = await GET(request);
      const json = await response.json();

      const slugs = json.projects.map((p: any) => p.slug);
      const uniqueSlugs = new Set(slugs);

      expect(slugs.length).toBe(uniqueSlugs.size);
    });

    it('should have valid chain IDs', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops');

      const response = await GET(request);
      const json = await response.json();

      if (json.projects.length > 0) {
        json.projects.forEach((project: any) => {
          project.chains.forEach((chainId: number) => {
            expect(typeof chainId).toBe('number');
            expect(chainId).toBeGreaterThan(0);
          });
        });
      }
    });

    it('should have valid status values', async () => {
      const request = createMockRequest('http://localhost:3000/api/airdrops');

      const response = await GET(request);
      const json = await response.json();

      const validStatuses = ['confirmed', 'rumored', 'speculative', 'expired'];

      if (json.projects.length > 0) {
        json.projects.forEach((project: any) => {
          expect(validStatuses).toContain(project.status);
        });
      }
    });
  });
});

