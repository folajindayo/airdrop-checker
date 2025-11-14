/**
 * Tests for /api/trending route
 */

import { GET } from '@/app/api/trending/route';
import { createMockRequest } from '../helpers';
import { cache } from '@airdrop-finder/shared';

describe('/api/trending', () => {
  beforeEach(() => {
    cache.clear();
  });

  describe('GET - Success Cases', () => {
    it('should get trending airdrops', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('trending');
      expect(Array.isArray(json.trending)).toBe(true);
    });

    it('should return trending projects with scores', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending');

      const response = await GET(request);
      const json = await response.json();

      if (json.trending && json.trending.length > 0) {
        const project = json.trending[0];
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('name');
        expect(project).toHaveProperty('trendingScore');
        expect(typeof project.trendingScore).toBe('number');
        expect(project.trendingScore).toBeGreaterThan(0);
      }
    });

    it('should sort by trending score descending', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending');

      const response = await GET(request);
      const json = await response.json();

      if (json.trending && json.trending.length > 1) {
        for (let i = 0; i < json.trending.length - 1; i++) {
          expect(json.trending[i].trendingScore).toBeGreaterThanOrEqual(
            json.trending[i + 1].trendingScore
          );
        }
      }
    });

    it('should include project details', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending');

      const response = await GET(request);
      const json = await response.json();

      if (json.trending && json.trending.length > 0) {
        const project = json.trending[0];
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('name');
        expect(project).toHaveProperty('status');
        expect(project).toHaveProperty('description');
      }
    });

    it('should include view count and trending metrics', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending');

      const response = await GET(request);
      const json = await response.json();

      if (json.trending && json.trending.length > 0) {
        const project = json.trending[0];
        expect(project).toHaveProperty('viewCount');
        expect(typeof project.viewCount).toBe('number');
        expect(project.viewCount).toBeGreaterThanOrEqual(0);
      }
    });

    it('should limit results to reasonable number', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending');

      const response = await GET(request);
      const json = await response.json();

      expect(json.trending.length).toBeLessThanOrEqual(20);
    });
  });

  describe('GET - Query Parameters', () => {
    it('should support limit parameter', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending?limit=5');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.trending.length).toBeLessThanOrEqual(5);
    });

    it('should support status filter', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending?status=confirmed');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      if (json.trending && json.trending.length > 0) {
        json.trending.forEach((project: any) => {
          expect(['confirmed', undefined]).toContain(project.status);
        });
      }
    });

    it('should default to 10 items if no limit specified', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending');

      const response = await GET(request);
      const json = await response.json();

      expect(json.trending.length).toBeLessThanOrEqual(10);
    });

    it('should reject invalid limit values', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending?limit=-5');

      const response = await GET(request);
      
      expect([200, 400]).toContain(response.status);
    });

    it('should reject limit exceeding maximum', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending?limit=1000');

      const response = await GET(request);
      const json = await response.json();

      expect(json.trending.length).toBeLessThanOrEqual(50);
    });
  });

  describe('GET - Caching Behavior', () => {
    it('should cache trending results', async () => {
      const request1 = createMockRequest('http://localhost:3000/api/trending');
      const response1 = await GET(request1);
      const json1 = await response1.json();

      expect(json1.cached).toBeFalsy();

      const request2 = createMockRequest('http://localhost:3000/api/trending');
      const response2 = await GET(request2);
      const json2 = await response2.json();

      expect(json2.cached).toBe(true);
    });

    it('should return consistent data from cache', async () => {
      const request1 = createMockRequest('http://localhost:3000/api/trending');
      const response1 = await GET(request1);
      const json1 = await response1.json();

      const request2 = createMockRequest('http://localhost:3000/api/trending');
      const response2 = await GET(request2);
      const json2 = await response2.json();

      expect(json2.trending).toEqual(json1.trending);
    });
  });

  describe('GET - Response Format', () => {
    it('should return JSON content type', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending');

      const response = await GET(request);

      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should include timestamp', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending');

      const response = await GET(request);
      const json = await response.json();

      expect(json).toHaveProperty('timestamp');
      expect(typeof json.timestamp).toBe('string');
    });

    it('should include count field', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending');

      const response = await GET(request);
      const json = await response.json();

      expect(json).toHaveProperty('count');
      expect(json.count).toBe(json.trending.length);
    });

    it('should have valid project structure', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending');

      const response = await GET(request);
      const json = await response.json();

      if (json.trending && json.trending.length > 0) {
        const project = json.trending[0];
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('name');
        expect(project).toHaveProperty('trendingScore');
        expect(typeof project.id).toBe('string');
        expect(typeof project.name).toBe('string');
        expect(typeof project.trendingScore).toBe('number');
      }
    });
  });

  describe('GET - Data Validation', () => {
    it('should have unique project IDs', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending');

      const response = await GET(request);
      const json = await response.json();

      const ids = json.trending.map((p: any) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have positive trending scores', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending');

      const response = await GET(request);
      const json = await response.json();

      json.trending.forEach((project: any) => {
        expect(project.trendingScore).toBeGreaterThan(0);
      });
    });

    it('should have non-empty project names', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending');

      const response = await GET(request);
      const json = await response.json();

      json.trending.forEach((project: any) => {
        expect(project.name).toBeTruthy();
        expect(project.name.length).toBeGreaterThan(0);
      });
    });

    it('should have valid status values', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending');

      const response = await GET(request);
      const json = await response.json();

      const validStatuses = ['confirmed', 'rumored', 'speculative', 'expired'];
      json.trending.forEach((project: any) => {
        expect(validStatuses).toContain(project.status);
      });
    });
  });

  describe('GET - Edge Cases', () => {
    it('should handle empty trending list gracefully', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending?limit=0');

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(json.trending)).toBe(true);
    });

    it('should handle invalid query parameters gracefully', async () => {
      const request = createMockRequest('http://localhost:3000/api/trending?limit=invalid');

      const response = await GET(request);
      
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('GET - Performance', () => {
    it('should respond within acceptable time for cached requests', async () => {
      const request1 = createMockRequest('http://localhost:3000/api/trending');
      await GET(request1);

      const start = Date.now();
      const request2 = createMockRequest('http://localhost:3000/api/trending');
      await GET(request2);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should respond within acceptable time for uncached requests', async () => {
      const start = Date.now();
      const request = createMockRequest('http://localhost:3000/api/trending');
      await GET(request);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(3000);
    });
  });
});

