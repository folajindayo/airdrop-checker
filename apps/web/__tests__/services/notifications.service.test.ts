/**
 * Tests for NotificationsService
 */

import { NotificationsService } from '@/lib/services/notifications.service';

describe('NotificationsService', () => {
  const testUserId = 'user-123';

  describe('createNotification', () => {
    it('should create a notification', async () => {
      const notification = await NotificationsService.createNotification({
        userId: testUserId,
        type: 'info',
        title: 'Test Notification',
        message: 'Test message',
      });

      expect(notification).toBeDefined();
      expect(notification.type).toBe('info');
      expect(notification.title).toBe('Test Notification');
    });

    it('should set read status to false by default', async () => {
      const notification = await NotificationsService.createNotification({
        userId: testUserId,
        type: 'info',
        title: 'Test',
        message: 'Test',
      });

      expect(notification.read).toBe(false);
    });
  });

  describe('getNotifications', () => {
    it('should get notifications for user', async () => {
      const notifications = await NotificationsService.getNotifications(testUserId);

      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should filter unread notifications', async () => {
      const unread = await NotificationsService.getNotifications(testUserId, true);

      expect(Array.isArray(unread)).toBe(true);
      unread.forEach((n) => expect(n.read).toBe(false));
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = await NotificationsService.createNotification({
        userId: testUserId,
        type: 'info',
        title: 'Test',
        message: 'Test',
      });

      const updated = await NotificationsService.markAsRead(testUserId, notification.id);

      expect(updated).toBe(true);
    });
  });
});

