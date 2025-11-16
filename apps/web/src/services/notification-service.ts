/**
 * Notification Service
 * Handles user notifications across different channels
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Array<(notification: Notification) => void> = [];

  /**
   * Send notification
   */
  async send(
    type: NotificationType,
    title: string,
    message: string,
    options?: { actionUrl?: string }
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      actionUrl: options?.actionUrl,
    };

    this.notifications.unshift(notification);
    this.notifyListeners(notification);

    return notification;
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return this.notifications;
  }

  /**
   * Get unread notifications
   */
  getUnread(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => (n.read = true));
  }

  /**
   * Delete notification
   */
  delete(id: string): boolean {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = [];
  }

  /**
   * Subscribe to notifications
   */
  subscribe(listener: (notification: Notification) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyListeners(notification: Notification): void {
    this.listeners.forEach(listener => listener(notification));
  }
}

export const notificationService = new NotificationService();

