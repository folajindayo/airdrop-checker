/**
 * @fileoverview Notification service for managing user notifications
 * Handles in-app notifications, email notifications, and push notifications
 */

import { logger } from '../monitoring/logger';

/**
 * Notification type enum
 */
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  AIRDROP_ELIGIBLE = 'airdrop_eligible',
  AIRDROP_CLAIMED = 'airdrop_claimed',
  NEW_AIRDROP = 'new_airdrop',
  BALANCE_CHANGE = 'balance_change',
  TRANSACTION = 'transaction',
}

/**
 * Notification priority
 */
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Notification interface
 */
export interface Notification {
  /** Notification ID */
  id: string;
  /** Notification type */
  type: NotificationType;
  /** Notification title */
  title: string;
  /** Notification message */
  message: string;
  /** Priority level */
  priority: NotificationPriority;
  /** User ID */
  userId?: string;
  /** Created timestamp */
  createdAt: number;
  /** Read status */
  read: boolean;
  /** Expiration timestamp */
  expiresAt?: number;
  /** Additional data */
  data?: Record<string, any>;
  /** Action URL */
  actionUrl?: string;
  /** Action label */
  actionLabel?: string;
}

/**
 * Notification preferences interface
 */
export interface NotificationPreferences {
  /** Enable email notifications */
  email: boolean;
  /** Enable push notifications */
  push: boolean;
  /** Enable in-app notifications */
  inApp: boolean;
  /** Notification types to receive */
  types: NotificationType[];
  /** Quiet hours (don't send notifications during this time) */
  quietHours?: {
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

/**
 * Notification service class
 */
export class NotificationService {
  private notifications: Map<string, Notification>;
  private preferences: Map<string, NotificationPreferences>;

  constructor() {
    this.notifications = new Map();
    this.preferences = new Map();
  }

  /**
   * Create a new notification
   */
  async create(
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>
  ): Promise<Notification> {
    const id = this.generateNotificationId();
    const now = Date.now();

    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: now,
      read: false,
    };

    this.notifications.set(id, newNotification);

    logger.info('Notification created', {
      id,
      type: notification.type,
      userId: notification.userId,
    });

    // Send notification through various channels
    await this.sendNotification(newNotification);

    return newNotification;
  }

  /**
   * Send notification through configured channels
   */
  private async sendNotification(notification: Notification): Promise<void> {
    if (!notification.userId) {
      return;
    }

    const prefs = this.getPreferences(notification.userId);

    // Check if notification type is enabled
    if (!prefs.types.includes(notification.type)) {
      return;
    }

    // Check quiet hours
    if (this.isQuietHours(prefs)) {
      logger.debug('Skipping notification due to quiet hours', {
        notificationId: notification.id,
      });
      return;
    }

    // Send through enabled channels
    const promises: Promise<void>[] = [];

    if (prefs.email) {
      promises.push(this.sendEmail(notification));
    }

    if (prefs.push) {
      promises.push(this.sendPush(notification));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: Notification): Promise<void> {
    try {
      logger.info('Sending email notification', {
        notificationId: notification.id,
        userId: notification.userId,
      });

      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      // await emailService.send({
      //   to: userEmail,
      //   subject: notification.title,
      //   body: notification.message,
      // });
    } catch (error) {
      logger.error('Failed to send email notification', {
        error,
        notificationId: notification.id,
      });
    }
  }

  /**
   * Send push notification
   */
  private async sendPush(notification: Notification): Promise<void> {
    try {
      logger.info('Sending push notification', {
        notificationId: notification.id,
        userId: notification.userId,
      });

      // In production, integrate with push service (Firebase, OneSignal, etc.)
      // await pushService.send({
      //   userId: notification.userId,
      //   title: notification.title,
      //   body: notification.message,
      // });
    } catch (error) {
      logger.error('Failed to send push notification', {
        error,
        notificationId: notification.id,
      });
    }
  }

  /**
   * Get notification by ID
   */
  get(id: string): Notification | undefined {
    return this.notifications.get(id);
  }

  /**
   * Get all notifications for user
   */
  getByUserId(userId: string, options?: {
    unreadOnly?: boolean;
    limit?: number;
    type?: NotificationType;
  }): Notification[] {
    const { unreadOnly = false, limit, type } = options || {};

    let notifications = Array.from(this.notifications.values()).filter(
      (n) => n.userId === userId
    );

    if (unreadOnly) {
      notifications = notifications.filter((n) => !n.read);
    }

    if (type) {
      notifications = notifications.filter((n) => n.type === type);
    }

    // Sort by created date (newest first)
    notifications.sort((a, b) => b.createdAt - a.createdAt);

    if (limit) {
      notifications = notifications.slice(0, limit);
    }

    return notifications;
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): boolean {
    const notification = this.notifications.get(id);

    if (!notification) {
      return false;
    }

    notification.read = true;
    this.notifications.set(id, notification);

    logger.debug('Notification marked as read', { id });

    return true;
  }

  /**
   * Mark all notifications as read for user
   */
  markAllAsRead(userId: string): number {
    let count = 0;

    this.notifications.forEach((notification) => {
      if (notification.userId === userId && !notification.read) {
        notification.read = true;
        this.notifications.set(notification.id, notification);
        count++;
      }
    });

    logger.info('Marked all notifications as read', { userId, count });

    return count;
  }

  /**
   * Delete notification
   */
  delete(id: string): boolean {
    const deleted = this.notifications.delete(id);

    if (deleted) {
      logger.debug('Notification deleted', { id });
    }

    return deleted;
  }

  /**
   * Delete all notifications for user
   */
  deleteAll(userId: string): number {
    let count = 0;

    this.notifications.forEach((notification, id) => {
      if (notification.userId === userId) {
        this.notifications.delete(id);
        count++;
      }
    });

    logger.info('Deleted all notifications', { userId, count });

    return count;
  }

  /**
   * Get unread count for user
   */
  getUnreadCount(userId: string): number {
    return this.getByUserId(userId, { unreadOnly: true }).length;
  }

  /**
   * Get notification preferences for user
   */
  getPreferences(userId: string): NotificationPreferences {
    return (
      this.preferences.get(userId) || {
        email: true,
        push: true,
        inApp: true,
        types: Object.values(NotificationType),
      }
    );
  }

  /**
   * Update notification preferences for user
   */
  updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): NotificationPreferences {
    const current = this.getPreferences(userId);
    const updated = { ...current, ...preferences };

    this.preferences.set(userId, updated);

    logger.info('Notification preferences updated', { userId, preferences });

    return updated;
  }

  /**
   * Check if currently in quiet hours
   */
  private isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHours) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const { start, end } = preferences.quietHours;

    // Handle quiet hours that span midnight
    if (start > end) {
      return currentTime >= start || currentTime < end;
    }

    return currentTime >= start && currentTime < end;
  }

  /**
   * Clean up expired notifications
   */
  cleanupExpired(): number {
    const now = Date.now();
    let count = 0;

    this.notifications.forEach((notification, id) => {
      if (notification.expiresAt && notification.expiresAt < now) {
        this.notifications.delete(id);
        count++;
      }
    });

    if (count > 0) {
      logger.info('Cleaned up expired notifications', { count });
    }

    return count;
  }

  /**
   * Generate notification ID
   */
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create airdrop eligibility notification
   */
  async notifyAirdropEligible(
    userId: string,
    airdropName: string,
    estimatedAmount: string
  ): Promise<Notification> {
    return this.create({
      type: NotificationType.AIRDROP_ELIGIBLE,
      title: 'You\'re Eligible for an Airdrop!',
      message: `Congratulations! You're eligible for the ${airdropName} airdrop. Estimated amount: ${estimatedAmount}`,
      priority: NotificationPriority.HIGH,
      userId,
      actionUrl: `/airdrops/${airdropName}`,
      actionLabel: 'View Details',
    });
  }

  /**
   * Create new airdrop notification
   */
  async notifyNewAirdrop(
    userId: string,
    airdropName: string
  ): Promise<Notification> {
    return this.create({
      type: NotificationType.NEW_AIRDROP,
      title: 'New Airdrop Available',
      message: `A new airdrop has been added: ${airdropName}. Check if you're eligible!`,
      priority: NotificationPriority.MEDIUM,
      userId,
      actionUrl: `/airdrops/${airdropName}`,
      actionLabel: 'Check Eligibility',
    });
  }

  /**
   * Create balance change notification
   */
  async notifyBalanceChange(
    userId: string,
    token: string,
    oldBalance: string,
    newBalance: string
  ): Promise<Notification> {
    const change = parseFloat(newBalance) - parseFloat(oldBalance);
    const direction = change > 0 ? 'increased' : 'decreased';

    return this.create({
      type: NotificationType.BALANCE_CHANGE,
      title: 'Balance Changed',
      message: `Your ${token} balance has ${direction} from ${oldBalance} to ${newBalance}`,
      priority: NotificationPriority.LOW,
      userId,
      data: { token, oldBalance, newBalance, change },
    });
  }

  /**
   * Get notification statistics
   */
  getStats(userId?: string): {
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  } {
    const notifications = userId
      ? this.getByUserId(userId)
      : Array.from(this.notifications.values());

    const stats = {
      total: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    };

    notifications.forEach((notification) => {
      stats.byType[notification.type] =
        (stats.byType[notification.type] || 0) + 1;
      stats.byPriority[notification.priority] =
        (stats.byPriority[notification.priority] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

