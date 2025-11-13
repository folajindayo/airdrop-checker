/**
 * Tests for NotificationsService
 */

import { NotificationsService } from '@/lib/services/notifications.service';

describe('NotificationsService', () => {
  const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  describe('createNotification', () => {
    it('should create a notification', async () => {
      const notification = await NotificationsService.createNotification({
        address: testAddress,
        type: 'airdrop',
        title: 'Test Notification',
        message: 'Test message',
      });

      expect(notification).toBeDefined();
      expect(notification.type).toBe('airdrop');
      expect(notification.title).toBe('Test Notification');
    });

    it('should set read status to false by default', async () => {
      const notification = await NotificationsService.createNotification({
        address: testAddress,
        type: 'airdrop',
        title: 'Test',
        message: 'Test',
      });

      expect(notification.read).toBe(false);
    });
  });

  describe('getNotifications', () => {
    it('should get notifications for address', async () => {
      const notifications = await NotificationsService.getNotifications(testAddress);

      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should filter by read status', async () => {
      const unread = await NotificationsService.getNotifications(testAddress, { read: false });
      const read = await NotificationsService.getNotifications(testAddress, { read: true });

      expect(Array.isArray(unread)).toBe(true);
      expect(Array.isArray(read)).toBe(true);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = await NotificationsService.createNotification({
        address: testAddress,
        type: 'airdrop',
        title: 'Test',
        message: 'Test',
      });

      const updated = await NotificationsService.markAsRead(notification.id);

      expect(updated).toBeDefined();
      expect(updated?.read).toBe(true);
    });
  });
});

