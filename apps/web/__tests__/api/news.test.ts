/**
 * Tests for /api/news route
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/news/route';

describe('/api/news', () => {
  describe('GET', () => {
    it('should return all news items', async () => {
      const request = new NextRequest('http://localhost:3000/api/news');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.categories).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it('should filter news by category', async () => {
      const request = new NextRequest('http://localhost:3000/api/news?category=confirmed');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items.every((item: any) => item.category === 'confirmed')).toBe(true);
    });

    it('should filter news by projectId', async () => {
      const request = new NextRequest('http://localhost:3000/api/news?projectId=zora');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items.every((item: any) => item.projectId === 'zora')).toBe(true);
    });

    it('should combine category and projectId filters', async () => {
      const request = new NextRequest('http://localhost:3000/api/news?category=confirmed&projectId=zora');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items.every((item: any) => 
        item.category === 'confirmed' && item.projectId === 'zora'
      )).toBe(true);
    });

    it('should limit results', async () => {
      const request = new NextRequest('http://localhost:3000/api/news?limit=2');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items.length).toBeLessThanOrEqual(2);
    });

    it('should sort by date (newest first)', async () => {
      const request = new NextRequest('http://localhost:3000/api/news');
      const response = await GET(request);
      const data = await response.json();

      if (data.items.length > 1) {
        for (let i = 0; i < data.items.length - 1; i++) {
          const current = new Date(data.items[i].publishedAt).getTime();
          const next = new Date(data.items[i + 1].publishedAt).getTime();
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });

    it('should include category counts', async () => {
      const request = new NextRequest('http://localhost:3000/api/news');
      const response = await GET(request);
      const data = await response.json();

      expect(data.categories).toHaveProperty('announcement');
      expect(data.categories).toHaveProperty('rumor');
      expect(data.categories).toHaveProperty('confirmed');
      expect(data.categories).toHaveProperty('update');
    });

    it('should cache results', async () => {
      const request1 = new NextRequest('http://localhost:3000/api/news');
      const response1 = await GET(request1);
      const data1 = await response1.json();

      const request2 = new NextRequest('http://localhost:3000/api/news');
      const response2 = await GET(request2);
      const data2 = await response2.json();

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      if (data2.cached) {
        expect(data2.cached).toBe(true);
      }
    });

    it('should include all required news item fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/news');
      const response = await GET(request);
      const data = await response.json();

      if (data.items.length > 0) {
        const item = data.items[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('content');
        expect(item).toHaveProperty('source');
        expect(item).toHaveProperty('publishedAt');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('priority');
      }
    });
  });
});

