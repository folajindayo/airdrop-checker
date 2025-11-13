/**
 * Tests for /api/share route
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/share/route';

describe('/api/share', () => {
  const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  describe('POST', () => {
    it('should create share link successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          shareType: 'eligibility',
          data: { score: 75 },
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.shareId).toBeDefined();
      expect(data.shareUrl).toBeDefined();
      expect(data.expiresAt).toBeDefined();
      expect(data.message).toBeDefined();
    });

    it('should return error for invalid address', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          address: 'invalid-address',
          shareType: 'eligibility',
          data: {},
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Valid address required');
    });

    it('should return error for invalid shareType', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          shareType: 'invalid-type',
          data: {},
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Valid shareType required');
    });

    it('should accept all valid share types', async () => {
      const shareTypes = ['eligibility', 'portfolio', 'roi', 'comparison'];

      for (const shareType of shareTypes) {
        const request = new NextRequest('http://localhost:3000/api/share', {
          method: 'POST',
          body: JSON.stringify({
            address: validAddress,
            shareType,
            data: {},
          }),
          headers: { 'Content-Type': 'application/json' },
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      }
    });

    it('should set expiration time correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          shareType: 'eligibility',
          data: {},
          expiresInHours: 48,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      const expiresAt = new Date(data.expiresAt);
      const now = new Date();
      const hoursDiff = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      expect(hoursDiff).toBeGreaterThan(47);
      expect(hoursDiff).toBeLessThan(49);
    });
  });

  describe('GET', () => {
    it('should retrieve share link by ID', async () => {
      // First create a share link
      const createRequest = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          shareType: 'eligibility',
          data: { score: 75 },
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const createResponse = await POST(createRequest);
      const createData = await createResponse.json();
      const shareId = createData.shareId;

      const request = new NextRequest(`http://localhost:3000/api/share?id=${shareId}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.shareLink).toBeDefined();
      expect(data.shareLink.id).toBe(shareId);
      expect(data.shareLink.shareType).toBe('eligibility');
      expect(data.shareLink.data).toBeDefined();
      expect(data.shareLink.views).toBe(1);
    });

    it('should return error when share ID is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/share');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Share ID required');
    });

    it('should return error when share link not found', async () => {
      const request = new NextRequest('http://localhost:3000/api/share?id=non-existent');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('not found');
    });

    it('should increment views on access', async () => {
      // Create share link
      const createRequest = new NextRequest('http://localhost:3000/api/share', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          shareType: 'eligibility',
          data: {},
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const createResponse = await POST(createRequest);
      const createData = await createResponse.json();
      const shareId = createData.shareId;

      // Access multiple times
      for (let i = 0; i < 3; i++) {
        const request = new NextRequest(`http://localhost:3000/api/share?id=${shareId}`);
        const response = await GET(request);
        const data = await response.json();
        expect(data.shareLink.views).toBe(i + 1);
      }
    });
  });
});

