export interface Notification {
  id: string;
  userId: string;
  type: "airdrop" | "wallet" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export class NotificationService {
  private notifications: Notification[] = [];

  create(
    userId: string,
    type: Notification["type"],
    title: string,
    message: string,
    data?: Record<string, any>
  ): Notification {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      data,
    };

    this.notifications.push(notification);

    // In production, store in database and send via websocket/push
    console.log("Notification created:", notification);

    return notification;
  }

  getForUser(userId: string, unreadOnly: boolean = false): Notification[] {
    let userNotifications = this.notifications.filter(
      (n) => n.userId === userId
    );

    if (unreadOnly) {
      userNotifications = userNotifications.filter((n) => !n.read);
    }

    return userNotifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.find((n) => n.id === notificationId);

    if (!notification) {
      return false;
    }

    notification.read = true;
    return true;
  }

  markAllAsRead(userId: string): number {
    const userNotifications = this.notifications.filter(
      (n) => n.userId === userId && !n.read
    );

    userNotifications.forEach((n) => (n.read = true));

    return userNotifications.length;
  }

  delete(notificationId: string): boolean {
    const index = this.notifications.findIndex((n) => n.id === notificationId);

    if (index === -1) {
      return false;
    }

    this.notifications.splice(index, 1);
    return true;
  }

  getUnreadCount(userId: string): number {
    return this.notifications.filter((n) => n.userId === userId && !n.read).length;
  }
}

export const notificationService = new NotificationService();

