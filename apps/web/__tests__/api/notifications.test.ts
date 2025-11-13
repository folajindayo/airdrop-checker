/**
 * Tests for /api/notifications route
 */

import { NextRequest } from 'next/server';
import { GET, POST, PATCH, DELETE } from '@/app/api/notifications/route';
import { isValidAddress } from '@airdrop-finder/shared';

describe('/api/notifications', () => {
  const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  describe('GET', () => {
    it('should return notifications for valid address', async () => {
      const request = new NextRequest(`http://localhost:3000/api/notifications?address=${validAddress}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.notifications).toBeDefined();
      expect(Array.isArray(data.notifications)).toBe(true);
      expect(data.unreadCount).toBeDefined();
      expect(data.totalCount).toBeDefined();
    });

    it('should filter unread notifications only', async () => {
      // First create a notification
      const createRequest = new NextRequest('http://localhost:3000/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          type: 'new_airdrop',
          title: 'Test Notification',
          message: 'Test message',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      await POST(createRequest);

      const request = new NextRequest(`http://localhost:3000/api/notifications?address=${validAddress}&unreadOnly=true`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.notifications.every((n: any) => !n.read)).toBe(true);
    });

    it('should return error for invalid address', async () => {
      const request = new NextRequest('http://localhost:3000/api/notifications?address=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Valid address parameter required');
    });

    it('should return error when address is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST', () => {
    it('should create notification with valid data', async () => {
      const request = new NextRequest('http://localhost:3000/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          type: 'new_airdrop',
          title: 'New Airdrop Available',
          message: 'A new airdrop is available for your address',
          projectId: 'project-1',
          projectName: 'Test Project',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.notification).toBeDefined();
      expect(data.notification.address).toBe(validAddress.toLowerCase());
      expect(data.notification.type).toBe('new_airdrop');
      expect(data.notification.title).toBe('New Airdrop Available');
      expect(data.notification.read).toBe(false);
      expect(data.message).toBeDefined();
    });

    it('should return error for invalid address', async () => {
      const request = new NextRequest('http://localhost:3000/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          address: 'invalid',
          type: 'new_airdrop',
          title: 'Test',
          message: 'Test',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return error when required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('required');
    });
  });

  describe('PATCH', () => {
    it('should mark single notification as read', async () => {
      // First create a notification
      const createRequest = new NextRequest('http://localhost:3000/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          type: 'new_airdrop',
          title: 'Test Notification',
          message: 'Test message',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const createResponse = await POST(createRequest);
      const createData = await createResponse.json();
      const notificationId = createData.notification.id;

      const request = new NextRequest('http://localhost:3000/api/notifications', {
        method: 'PATCH',
        body: JSON.stringify({
          address: validAddress,
          notificationId,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('marked as read');
    });

    it('should mark all notifications as read', async () => {
      const request = new NextRequest('http://localhost:3000/api/notifications', {
        method: 'PATCH',
        body: JSON.stringify({
          address: validAddress,
          markAllRead: true,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('All notifications marked as read');
    });

    it('should return error when notification not found', async () => {
      const request = new NextRequest('http://localhost:3000/api/notifications', {
        method: 'PATCH',
        body: JSON.stringify({
          address: validAddress,
          notificationId: 'non-existent-id',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });
  });

  describe('DELETE', () => {
    it('should delete notification', async () => {
      // First create a notification
      const createRequest = new NextRequest('http://localhost:3000/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          address: validAddress,
          type: 'new_airdrop',
          title: 'Test Notification',
          message: 'Test message',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const createResponse = await POST(createRequest);
      const createData = await createResponse.json();
      const notificationId = createData.notification.id;

      const request = new NextRequest(`http://localhost:3000/api/notifications?address=${validAddress}&id=${notificationId}`, {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('deleted');
    });

    it('should return error when notification not found', async () => {
      const request = new NextRequest(`http://localhost:3000/api/notifications?address=${validAddress}&id=non-existent`, {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });

    it('should return error when notification ID is missing', async () => {
      const request = new NextRequest(`http://localhost:3000/api/notifications?address=${validAddress}`, {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });
});

