/**
 * @fileoverview Tests for notification service
 */

import {
  NotificationService,
  NotificationType,
  NotificationPriority,
} from '@/lib/services/notification-service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  describe('Notification Creation', () => {
    it('should create notification', async () => {
      const notification = await service.create({
        type: NotificationType.INFO,
        title: 'Test Notification',
        message: 'This is a test',
        priority: NotificationPriority.MEDIUM,
      });

      expect(notification.id).toBeTruthy();
      expect(notification.title).toBe('Test Notification');
      expect(notification.read).toBe(false);
    });

    it('should assign unique IDs', async () => {
      const notif1 = await service.create({
        type: NotificationType.INFO,
        title: 'Test 1',
        message: 'Message 1',
        priority: NotificationPriority.LOW,
      });

      const notif2 = await service.create({
        type: NotificationType.INFO,
        title: 'Test 2',
        message: 'Message 2',
        priority: NotificationPriority.LOW,
      });

      expect(notif1.id).not.toBe(notif2.id);
    });

    it('should set creation timestamp', async () => {
      const before = Date.now();

      const notification = await service.create({
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        priority: NotificationPriority.LOW,
      });

      const after = Date.now();

      expect(notification.createdAt).toBeGreaterThanOrEqual(before);
      expect(notification.createdAt).toBeLessThanOrEqual(after);
    });

    it('should initialize read status as false', async () => {
      const notification = await service.create({
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        priority: NotificationPriority.LOW,
      });

      expect(notification.read).toBe(false);
    });

    it('should store additional data', async () => {
      const data = { custom: 'value', nested: { field: 123 } };

      const notification = await service.create({
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        priority: NotificationPriority.LOW,
        data,
      });

      expect(notification.data).toEqual(data);
    });

    it('should store action URL and label', async () => {
      const notification = await service.create({
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        priority: NotificationPriority.LOW,
        actionUrl: '/test',
        actionLabel: 'Click Here',
      });

      expect(notification.actionUrl).toBe('/test');
      expect(notification.actionLabel).toBe('Click Here');
    });
  });

  describe('Notification Retrieval', () => {
    it('should get notification by ID', async () => {
      const created = await service.create({
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        priority: NotificationPriority.LOW,
      });

      const retrieved = service.get(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return undefined for non-existent ID', () => {
      const retrieved = service.get('non-existent-id');

      expect(retrieved).toBeUndefined();
    });

    it('should get notifications by user ID', async () => {
      await service.create({
        type: NotificationType.INFO,
        title: 'Test 1',
        message: 'Message 1',
        priority: NotificationPriority.LOW,
        userId: 'user123',
      });

      await service.create({
        type: NotificationType.INFO,
        title: 'Test 2',
        message: 'Message 2',
        priority: NotificationPriority.LOW,
        userId: 'user123',
      });

      await service.create({
        type: NotificationType.INFO,
        title: 'Test 3',
        message: 'Message 3',
        priority: NotificationPriority.LOW,
        userId: 'user456',
      });

      const notifications = service.getByUserId('user123');

      expect(notifications.length).toBe(2);
      expect(notifications.every((n) => n.userId === 'user123')).toBe(true);
    });

    it('should filter unread notifications', async () => {
      const notif1 = await service.create({
        type: NotificationType.INFO,
        title: 'Test 1',
        message: 'Message 1',
        priority: NotificationPriority.LOW,
        userId: 'user123',
      });

      await service.create({
        type: NotificationType.INFO,
        title: 'Test 2',
        message: 'Message 2',
        priority: NotificationPriority.LOW,
        userId: 'user123',
      });

      service.markAsRead(notif1.id);

      const unread = service.getByUserId('user123', { unreadOnly: true });

      expect(unread.length).toBe(1);
      expect(unread[0].read).toBe(false);
    });

    it('should limit results', async () => {
      for (let i = 0; i < 10; i++) {
        await service.create({
          type: NotificationType.INFO,
          title: `Test ${i}`,
          message: `Message ${i}`,
          priority: NotificationPriority.LOW,
          userId: 'user123',
        });
      }

      const notifications = service.getByUserId('user123', { limit: 5 });

      expect(notifications.length).toBe(5);
    });

    it('should filter by type', async () => {
      await service.create({
        type: NotificationType.INFO,
        title: 'Info',
        message: 'Info message',
        priority: NotificationPriority.LOW,
        userId: 'user123',
      });

      await service.create({
        type: NotificationType.SUCCESS,
        title: 'Success',
        message: 'Success message',
        priority: NotificationPriority.LOW,
        userId: 'user123',
      });

      const infoNotifications = service.getByUserId('user123', {
        type: NotificationType.INFO,
      });

      expect(infoNotifications.length).toBe(1);
      expect(infoNotifications[0].type).toBe(NotificationType.INFO);
    });

    it('should sort by created date (newest first)', async () => {
      const notif1 = await service.create({
        type: NotificationType.INFO,
        title: 'First',
        message: 'First message',
        priority: NotificationPriority.LOW,
        userId: 'user123',
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const notif2 = await service.create({
        type: NotificationType.INFO,
        title: 'Second',
        message: 'Second message',
        priority: NotificationPriority.LOW,
        userId: 'user123',
      });

      const notifications = service.getByUserId('user123');

      expect(notifications[0].id).toBe(notif2.id);
      expect(notifications[1].id).toBe(notif1.id);
    });
  });

  describe('Read Status', () => {
    it('should mark notification as read', async () => {
      const notification = await service.create({
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        priority: NotificationPriority.LOW,
      });

      const success = service.markAsRead(notification.id);

      expect(success).toBe(true);

      const updated = service.get(notification.id);
      expect(updated?.read).toBe(true);
    });

    it('should return false for non-existent notification', () => {
      const success = service.markAsRead('non-existent-id');

      expect(success).toBe(false);
    });

    it('should mark all notifications as read', async () => {
      await service.create({
        type: NotificationType.INFO,
        title: 'Test 1',
        message: 'Message 1',
        priority: NotificationPriority.LOW,
        userId: 'user123',
      });

      await service.create({
        type: NotificationType.INFO,
        title: 'Test 2',
        message: 'Message 2',
        priority: NotificationPriority.LOW,
        userId: 'user123',
      });

      const count = service.markAllAsRead('user123');

      expect(count).toBe(2);

      const notifications = service.getByUserId('user123');
      expect(notifications.every((n) => n.read)).toBe(true);
    });

    it('should get unread count', async () => {
      await service.create({
        type: NotificationType.INFO,
        title: 'Test 1',
        message: 'Message 1',
        priority: NotificationPriority.LOW,
        userId: 'user123',
      });

      const notif2 = await service.create({
        type: NotificationType.INFO,
        title: 'Test 2',
        message: 'Message 2',
        priority: NotificationPriority.LOW,
        userId: 'user123',
      });

      service.markAsRead(notif2.id);

      const unreadCount = service.getUnreadCount('user123');

      expect(unreadCount).toBe(1);
    });
  });

  describe('Notification Deletion', () => {
    it('should delete notification', async () => {
      const notification = await service.create({
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        priority: NotificationPriority.LOW,
      });

      const success = service.delete(notification.id);

      expect(success).toBe(true);
      expect(service.get(notification.id)).toBeUndefined();
    });

    it('should return false for non-existent notification', () => {
      const success = service.delete('non-existent-id');

      expect(success).toBe(false);
    });

    it('should delete all notifications for user', async () => {
      await service.create({
        type: NotificationType.INFO,
        title: 'Test 1',
        message: 'Message 1',
        priority: NotificationPriority.LOW,
        userId: 'user123',
      });

      await service.create({
        type: NotificationType.INFO,
        title: 'Test 2',
        message: 'Message 2',
        priority: NotificationPriority.LOW,
        userId: 'user123',
      });

      const count = service.deleteAll('user123');

      expect(count).toBe(2);
      expect(service.getByUserId('user123').length).toBe(0);
    });
  });

  describe('Preferences', () => {
    it('should get default preferences', () => {
      const prefs = service.getPreferences('user123');

      expect(prefs.email).toBe(true);
      expect(prefs.push).toBe(true);
      expect(prefs.inApp).toBe(true);
      expect(prefs.types).toContain(NotificationType.INFO);
    });

    it('should update preferences', () => {
      service.updatePreferences('user123', {
        email: false,
        push: true,
      });

      const prefs = service.getPreferences('user123');

      expect(prefs.email).toBe(false);
      expect(prefs.push).toBe(true);
      expect(prefs.inApp).toBe(true);
    });

    it('should merge preferences', () => {
      service.updatePreferences('user123', {
        email: false,
      });

      service.updatePreferences('user123', {
        push: false,
      });

      const prefs = service.getPreferences('user123');

      expect(prefs.email).toBe(false);
      expect(prefs.push).toBe(false);
    });

    it('should set quiet hours', () => {
      service.updatePreferences('user123', {
        quietHours: {
          start: '22:00',
          end: '08:00',
        },
      });

      const prefs = service.getPreferences('user123');

      expect(prefs.quietHours).toEqual({
        start: '22:00',
        end: '08:00',
      });
    });

    it('should set notification types', () => {
      service.updatePreferences('user123', {
        types: [NotificationType.ERROR, NotificationType.SUCCESS],
      });

      const prefs = service.getPreferences('user123');

      expect(prefs.types).toEqual([
        NotificationType.ERROR,
        NotificationType.SUCCESS,
      ]);
    });
  });

  describe('Specialized Notifications', () => {
    it('should create airdrop eligibility notification', async () => {
      const notification = await service.notifyAirdropEligible(
        'user123',
        'TestAirdrop',
        '1000 TOKENS'
      );

      expect(notification.type).toBe(NotificationType.AIRDROP_ELIGIBLE);
      expect(notification.title).toContain('Eligible');
      expect(notification.message).toContain('TestAirdrop');
      expect(notification.priority).toBe(NotificationPriority.HIGH);
    });

    it('should create new airdrop notification', async () => {
      const notification = await service.notifyNewAirdrop('user123', 'NewAirdrop');

      expect(notification.type).toBe(NotificationType.NEW_AIRDROP);
      expect(notification.message).toContain('NewAirdrop');
      expect(notification.priority).toBe(NotificationPriority.MEDIUM);
    });

    it('should create balance change notification', async () => {
      const notification = await service.notifyBalanceChange(
        'user123',
        'ETH',
        '1.0',
        '2.0'
      );

      expect(notification.type).toBe(NotificationType.BALANCE_CHANGE);
      expect(notification.message).toContain('ETH');
      expect(notification.message).toContain('increased');
    });

    it('should detect balance decrease', async () => {
      const notification = await service.notifyBalanceChange(
        'user123',
        'ETH',
        '2.0',
        '1.0'
      );

      expect(notification.message).toContain('decreased');
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      await service.create({
        type: NotificationType.INFO,
        title: 'Info',
        message: 'Info message',
        priority: NotificationPriority.LOW,
        userId: 'user123',
      });

      await service.create({
        type: NotificationType.SUCCESS,
        title: 'Success',
        message: 'Success message',
        priority: NotificationPriority.MEDIUM,
        userId: 'user123',
      });

      await service.create({
        type: NotificationType.ERROR,
        title: 'Error',
        message: 'Error message',
        priority: NotificationPriority.HIGH,
        userId: 'user123',
      });
    });

    it('should calculate total notifications', () => {
      const stats = service.getStats('user123');

      expect(stats.total).toBe(3);
    });

    it('should calculate unread count', () => {
      const stats = service.getStats('user123');

      expect(stats.unread).toBe(3);
    });

    it('should group by type', () => {
      const stats = service.getStats('user123');

      expect(stats.byType[NotificationType.INFO]).toBe(1);
      expect(stats.byType[NotificationType.SUCCESS]).toBe(1);
      expect(stats.byType[NotificationType.ERROR]).toBe(1);
    });

    it('should group by priority', () => {
      const stats = service.getStats('user123');

      expect(stats.byPriority[NotificationPriority.LOW]).toBe(1);
      expect(stats.byPriority[NotificationPriority.MEDIUM]).toBe(1);
      expect(stats.byPriority[NotificationPriority.HIGH]).toBe(1);
    });

    it('should calculate global stats', () => {
      const stats = service.getStats();

      expect(stats.total).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Expiration', () => {
    it('should cleanup expired notifications', async () => {
      const expired = await service.create({
        type: NotificationType.INFO,
        title: 'Expired',
        message: 'This will expire',
        priority: NotificationPriority.LOW,
        expiresAt: Date.now() - 1000,
      });

      await service.create({
        type: NotificationType.INFO,
        title: 'Valid',
        message: 'This is valid',
        priority: NotificationPriority.LOW,
        expiresAt: Date.now() + 10000,
      });

      const count = service.cleanupExpired();

      expect(count).toBeGreaterThanOrEqual(1);
      expect(service.get(expired.id)).toBeUndefined();
    });

    it('should not cleanup non-expired notifications', async () => {
      const valid = await service.create({
        type: NotificationType.INFO,
        title: 'Valid',
        message: 'This is valid',
        priority: NotificationPriority.LOW,
        expiresAt: Date.now() + 10000,
      });

      service.cleanupExpired();

      expect(service.get(valid.id)).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle notifications without user ID', async () => {
      const notification = await service.create({
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        priority: NotificationPriority.LOW,
      });

      expect(notification.userId).toBeUndefined();
    });

    it('should handle getting notifications for user with no notifications', () => {
      const notifications = service.getByUserId('non-existent-user');

      expect(notifications).toEqual([]);
    });

    it('should handle marking all as read for user with no notifications', () => {
      const count = service.markAllAsRead('non-existent-user');

      expect(count).toBe(0);
    });

    it('should handle deleting all for user with no notifications', () => {
      const count = service.deleteAll('non-existent-user');

      expect(count).toBe(0);
    });
  });
});

