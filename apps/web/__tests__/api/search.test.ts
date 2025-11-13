/**
 * Tests for /api/search route
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/search/route';

// Mock dependencies
jest.mock('@/lib/db/models/project', () => ({
  findAllProjects: jest.fn(() => [
    {
      projectId: 'project-1',
      name: 'Test Project 1',
      slug: 'test-project-1',
      status: 'active',
      chains: ['ethereum', 'base'],
      criteria: [{ description: 'Swap on Uniswap' }],
      snapshotDate: '2024-01-01',
      claimUrl: 'https://claim.example.com',
      estimatedValue: '$100-$500',
      tags: ['defi', 'swap'],
      description: 'A test project',
    },
    {
      projectId: 'project-2',
      name: 'Another Project',
      slug: 'another-project',
      status: 'upcoming',
      chains: ['arbitrum'],
      criteria: [],
      tags: ['nft'],
    },
  ]),
}));

describe('/api/search', () => {
  describe('GET', () => {
    it('should return all projects when no filters are applied', async () => {
      const request = new NextRequest('http://localhost:3000/api/search');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results).toBeDefined();
      expect(Array.isArray(data.results)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.returned).toBeDefined();
      expect(data.filters).toBeDefined();
    });

    it('should filter by query string', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=Test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results.length).toBeGreaterThan(0);
      expect(data.results[0].name.toLowerCase()).toContain('test');
    });

    it('should filter by status', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?status=active');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results.every((r: any) => r.status === 'active')).toBe(true);
    });

    it('should filter by chain', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?chain=ethereum');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results.length).toBeGreaterThan(0);
    });

    it('should filter by hasSnapshot', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?hasSnapshot=true');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results.every((r: any) => r.snapshotDate)).toBe(true);
    });

    it('should filter by hasClaim', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?hasClaim=true');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results.every((r: any) => r.claimUrl)).toBe(true);
    });

    it('should filter by hasValue', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?hasValue=true');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results.every((r: any) => r.estimatedValue)).toBe(true);
    });

    it('should sort by name ascending', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?sortBy=name&sortOrder=asc');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      if (data.results.length > 1) {
        expect(data.results[0].name <= data.results[1].name).toBe(true);
      }
    });

    it('should sort by name descending', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?sortBy=name&sortOrder=desc');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      if (data.results.length > 1) {
        expect(data.results[0].name >= data.results[1].name).toBe(true);
      }
    });

    it('should limit results', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?limit=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results.length).toBeLessThanOrEqual(1);
      expect(data.returned).toBeLessThanOrEqual(1);
    });

    it('should combine multiple filters', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?status=active&hasSnapshot=true&sortBy=name');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results.every((r: any) => r.status === 'active' && r.snapshotDate)).toBe(true);
    });

    it('should include all required fields in results', async () => {
      const request = new NextRequest('http://localhost:3000/api/search');
      const response = await GET(request);
      const data = await response.json();

      if (data.results.length > 0) {
        const result = data.results[0];
        expect(result).toHaveProperty('projectId');
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('slug');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('chains');
        expect(result).toHaveProperty('criteriaCount');
      }
    });
  });
});

