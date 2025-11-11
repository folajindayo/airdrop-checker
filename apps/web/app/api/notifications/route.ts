import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { findAllProjects } from '@/lib/db/models/project';

export const dynamic = 'force-dynamic';

interface Notification {
  id: string;
  address: string;
  type: 'snapshot_reminder' | 'claim_available' | 'eligibility_change' | 'new_airdrop';
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// In-memory storage (in production, use database)
const notifications: Map<string, Notification[]> = new Map();

/**
 * GET /api/notifications
 * Get notifications for an address
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address parameter required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    let userNotifications = notifications.get(normalizedAddress) || [];

    if (unreadOnly) {
      userNotifications = userNotifications.filter((n) => !n.read);
    }

    // Sort by timestamp (newest first)
    userNotifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      notifications: userNotifications,
      unreadCount: userNotifications.filter((n) => !n.read).length,
      totalCount: notifications.get(normalizedAddress)?.length || 0,
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch notifications',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, type, title, message, projectId, projectName, actionUrl } = body;

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address required' },
        { status: 400 }
      );
    }

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'type, title, and message are required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const notification: Notification = {
      id: `${normalizedAddress}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      address: normalizedAddress,
      type,
      title,
      message,
      projectId,
      projectName,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl,
    };

    const userNotifications = notifications.get(normalizedAddress) || [];
    userNotifications.push(notification);
    notifications.set(normalizedAddress, userNotifications);

    return NextResponse.json({
      success: true,
      notification,
      message: 'Notification created successfully',
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create notification',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark notification as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, notificationId, markAllRead } = body;

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const userNotifications = notifications.get(normalizedAddress) || [];

    if (markAllRead) {
      userNotifications.forEach((n) => {
        n.read = true;
      });
    } else if (notificationId) {
      const notification = userNotifications.find((n) => n.id === notificationId);
      if (notification) {
        notification.read = true;
      } else {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'notificationId or markAllRead required' },
        { status: 400 }
      );
    }

    notifications.set(normalizedAddress, userNotifications);

    return NextResponse.json({
      success: true,
      message: markAllRead ? 'All notifications marked as read' : 'Notification marked as read',
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update notification',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Delete a notification
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const notificationId = searchParams.get('id');

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address parameter required' },
        { status: 400 }
      );
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const userNotifications = notifications.get(normalizedAddress) || [];
    const filtered = userNotifications.filter((n) => n.id !== notificationId);

    if (filtered.length === userNotifications.length) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    notifications.set(normalizedAddress, filtered);

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete notification',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



