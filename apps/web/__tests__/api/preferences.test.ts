/**
 * Tests for /api/preferences route
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/preferences/route';

describe('/api/preferences', () => {
  const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  describe('GET', () => {
    it('should return default preferences for new user', async () => {
      const request = new NextRequest(`http://localhost:3000/api/preferences?address=${validAddress}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.preferences).toBeDefined();
      expect(data.preferences.address).toBe(validAddress.toLowerCase());
      expect(data.preferences.notifications).toBeDefined();
      expect(data.preferences.display).toBeDefined();
      expect(data.preferences.alerts).toBeDefined();
      expect(data.preferences.privacy).toBeDefined();
    });

    it('should return error when address is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/preferences');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Address parameter required');
    });

    it('should return error for invalid address', async () => {
      const request = new NextRequest('http://localhost:3000/api/preferences?address=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Invalid Ethereum address');
    });

    it('should include default notification preferences', async () => {
      const request = new NextRequest(`http://localhost:3000/api/preferences?address=${validAddress}`);
      const response = await GET(request);
      const data = await response.json();

      expect(data.preferences.notifications).toHaveProperty('email');
      expect(data.preferences.notifications).toHaveProperty('push');
      expect(data.preferences.notifications).toHaveProperty('discord');
      expect(data.preferences.notifications).toHaveProperty('telegram');
    });
  });

  describe('POST', () => {
    it('should update preferences successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/preferences', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          preferences: {
            display: {
              theme: 'dark',
              currency: 'ETH',
              language: 'en',
            },
          },
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.preferences).toBeDefined();
      expect(data.preferences.display.theme).toBe('dark');
      expect(data.preferences.display.currency).toBe('ETH');
      expect(data.message).toBeDefined();
    });

    it('should merge with existing preferences', async () => {
      // First update some preferences
      const request1 = new NextRequest('http://localhost:3000/api/preferences', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          preferences: {
            notifications: {
              email: true,
            },
          },
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      await POST(request1);

      // Update different preferences
      const request2 = new NextRequest('http://localhost:3000/api/preferences', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          preferences: {
            display: {
              theme: 'light',
            },
          },
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request2);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.preferences.notifications.email).toBe(true);
      expect(data.preferences.display.theme).toBe('light');
    });

    it('should return error when address is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/preferences', {
        method: 'POST',
        body: JSON.stringify({
          preferences: {},
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return error for invalid address', async () => {
      const request = new NextRequest('http://localhost:3000/api/preferences', {
        method: 'POST',
        body: JSON.stringify({
          address: 'invalid-address',
          preferences: {},
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });
});

