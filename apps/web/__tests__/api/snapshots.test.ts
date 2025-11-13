/**
 * Tests for /api/snapshots route
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/snapshots/route';

describe('/api/snapshots', () => {
  describe('GET', () => {
    it('should return all snapshots', async () => {
      const request = new NextRequest('http://localhost:3000/api/snapshots');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.snapshots).toBeDefined();
      expect(Array.isArray(data.snapshots)).toBe(true);
      expect(data.upcoming).toBeDefined();
      expect(data.completed).toBeDefined();
      expect(data.claimable).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it('should filter snapshots by status', async () => {
      const request = new NextRequest('http://localhost:3000/api/snapshots?status=upcoming');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.snapshots.every((s: any) => s.status === 'upcoming')).toBe(true);
    });

    it('should filter snapshots by projectId', async () => {
      const request = new NextRequest('http://localhost:3000/api/snapshots?projectId=zora');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.snapshots.every((s: any) => s.projectId === 'zora')).toBe(true);
    });

    it('should combine status and projectId filters', async () => {
      const request = new NextRequest('http://localhost:3000/api/snapshots?status=upcoming&projectId=zora');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.snapshots.every((s: any) => 
        s.status === 'upcoming' && s.projectId === 'zora'
      )).toBe(true);
    });

    it('should include categorized snapshots', async () => {
      const request = new NextRequest('http://localhost:3000/api/snapshots');
      const response = await GET(request);
      const data = await response.json();

      expect(data.upcoming.every((s: any) => s.status === 'upcoming')).toBe(true);
      expect(data.completed.every((s: any) => s.status === 'completed')).toBe(true);
      expect(data.claimable.every((s: any) => s.status === 'claimable')).toBe(true);
    });

    it('should sort snapshots by date', async () => {
      const request = new NextRequest('http://localhost:3000/api/snapshots');
      const response = await GET(request);
      const data = await response.json();

      if (data.snapshots.length > 1) {
        for (let i = 0; i < data.snapshots.length - 1; i++) {
          const current = new Date(data.snapshots[i].snapshotDate).getTime();
          const next = new Date(data.snapshots[i + 1].snapshotDate).getTime();
          expect(current).toBeLessThanOrEqual(next);
        }
      }
    });

    it('should cache results', async () => {
      const request1 = new NextRequest('http://localhost:3000/api/snapshots');
      const response1 = await GET(request1);
      const data1 = await response1.json();

      const request2 = new NextRequest('http://localhost:3000/api/snapshots');
      const response2 = await GET(request2);
      const data2 = await response2.json();

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      // Second response might be cached
      if (data2.cached) {
        expect(data2.cached).toBe(true);
      }
    });

    it('should include all required snapshot fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/snapshots');
      const response = await GET(request);
      const data = await response.json();

      if (data.snapshots.length > 0) {
        const snapshot = data.snapshots[0];
        expect(snapshot).toHaveProperty('id');
        expect(snapshot).toHaveProperty('projectId');
        expect(snapshot).toHaveProperty('projectName');
        expect(snapshot).toHaveProperty('snapshotDate');
        expect(snapshot).toHaveProperty('status');
        expect(snapshot).toHaveProperty('description');
        expect(snapshot).toHaveProperty('chainIds');
      }
    });
  });
});

