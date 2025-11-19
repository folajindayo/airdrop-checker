"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Notification, notificationService } from "@/lib/services/notificationService";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    type: Notification["type"],
    title: string,
    message: string,
    data?: Record<string, any>
  ) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId?: string;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = useCallback(() => {
    if (!userId) return;

    const userNotifications = notificationService.getForUser(userId);
    setNotifications(userNotifications);
  }, [userId]);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const addNotification = useCallback(
    (
      type: Notification["type"],
      title: string,
      message: string,
      data?: Record<string, any>
    ) => {
      if (!userId) return;

      const notification = notificationService.create(userId, type, title, message, data);
      setNotifications((prev) => [notification, ...prev]);
    },
    [userId]
  );

  const markAsRead = useCallback((notificationId: string) => {
    notificationService.markAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    if (!userId) return;

    notificationService.markAllAsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [userId]);

  const deleteNotification = useCallback((notificationId: string) => {
    notificationService.delete(notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }

  return context;
}

