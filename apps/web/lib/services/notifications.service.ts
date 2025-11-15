/**
 * Notifications Service
 */

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export class NotificationsService {
  private static notifications = new Map<string, Notification[]>();

  static async getNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    const userNotifications = this.notifications.get(userId) || [];
    return unreadOnly ? userNotifications.filter(n => !n.read) : userNotifications;
  }

  static async createNotification(data: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> {
    const notification: Notification = {
      ...data,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const existing = this.notifications.get(data.userId) || [];
    existing.push(notification);
    this.notifications.set(data.userId, existing);

    return notification;
  }

  static async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    const notifications = this.notifications.get(userId);
    if (!notifications) return false;

    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return false;

    notification.read = true;
    return true;
  }

  static async markAllAsRead(userId: string): Promise<number> {
    const notifications = this.notifications.get(userId);
    if (!notifications) return 0;

    let count = 0;
    notifications.forEach(n => {
      if (!n.read) {
        n.read = true;
        count++;
      }
    });

    return count;
  }

  static async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    const notifications = this.notifications.get(userId);
    if (!notifications) return false;

    const filtered = notifications.filter(n => n.id !== notificationId);
    if (filtered.length === notifications.length) return false;

    this.notifications.set(userId, filtered);
    return true;
  }
}


