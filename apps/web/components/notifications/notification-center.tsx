'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Check, X, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'new-airdrop' | 'score-change' | 'snapshot-reminder' | 'claim-available';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

const STORAGE_KEY = 'airdrop-finder-notifications';
const MAX_NOTIFICATIONS = 50;

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);

  // Load notifications from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Notification[] = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const withDates = parsed.map((n) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(withDates);
      }

      // Check if notifications are enabled
      const enabled = localStorage.getItem('notifications-enabled');
      setIsEnabled(enabled !== 'false');
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  // Save notifications to localStorage
  const saveNotifications = (newNotifications: Notification[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotifications));
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
    toast.success('All notifications cleared');
  };

  const toggleNotifications = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('notifications-enabled', newState.toString());

    if (newState) {
      toast.success('Notifications enabled');
    } else {
      toast.info('Notifications disabled');
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new-airdrop':
        return <Sparkles className="h-4 w-4 text-blue-600" />;
      case 'score-change':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'snapshot-reminder':
        return <Calendar className="h-4 w-4 text-orange-600" />;
      case 'claim-available':
        return <Bell className="h-4 w-4 text-purple-600" />;
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {isEnabled ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          {unreadCount > 0 && isEnabled && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleNotifications}
                >
                  {isEnabled ? (
                    <Bell className="h-4 w-4" />
                  ) : (
                    <BellOff className="h-4 w-4" />
                  )}
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <CardDescription>
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 border-b hover:bg-accent/50 transition-colors',
                        !notification.read && 'bg-accent/20'
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-medium text-sm">
                              {notification.title}
                            </p>
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {getRelativeTime(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Mark read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {notifications.length > 0 && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={clearAll}
                    >
                      Clear all
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook to add notifications programmatically
export function useNotifications() {
  const addNotification = (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const existing: Notification[] = stored ? JSON.parse(stored) : [];

      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        read: false,
      };

      // Add to beginning and limit total
      const updated = [newNotification, ...existing].slice(0, MAX_NOTIFICATIONS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Show toast
      toast.info(notification.title, {
        description: notification.message,
      });

      // Dispatch event for NotificationCenter to update
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Failed to add notification:', error);
    }
  };

  return { addNotification };
}

