import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface Reminder {
  id: string;
  address: string;
  projectId?: string;
  projectName?: string;
  type: 'snapshot' | 'claim' | 'announcement' | 'custom';
  reminderTime: string; // ISO 8601 timestamp
  message: string;
  enabled: boolean;
  createdAt: string;
  sent: boolean;
  sentAt?: string;
}

// In-memory storage (in production, use database)
const reminders = new Map<string, Reminder>();

/**
 * POST /api/reminders
 * Create a new reminder
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, projectId, projectName, type, reminderTime, message } = body;

    if (!address || !reminderTime || !message) {
      return NextResponse.json(
        { success: false, error: 'Address, reminderTime, and message are required' },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const reminderDate = new Date(reminderTime);
    
    if (isNaN(reminderDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid reminderTime format. Use ISO 8601 format.' },
        { status: 400 }
      );
    }

    if (reminderDate < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Reminder time must be in the future' },
        { status: 400 }
      );
    }

    const validTypes = ['snapshot', 'claim', 'announcement', 'custom'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const id = `reminder-${normalizedAddress}-${Date.now()}`;
    const reminder: Reminder = {
      id,
      address: normalizedAddress,
      projectId,
      projectName,
      type,
      reminderTime: reminderDate.toISOString(),
      message,
      enabled: true,
      createdAt: new Date().toISOString(),
      sent: false,
    };

    reminders.set(id, reminder);

    return NextResponse.json({
      success: true,
      reminder,
      message: `Reminder set for ${reminderDate.toLocaleString()}`,
    });
  } catch (error) {
    console.error('Reminders API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create reminder',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reminders
 * Get reminders for an address
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const upcoming = searchParams.get('upcoming') === 'true';
    const sent = searchParams.get('sent') === 'true';

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    let userReminders = Array.from(reminders.values())
      .filter(reminder => reminder.address === normalizedAddress);

    // Filter by status
    if (upcoming) {
      userReminders = userReminders.filter(r => !r.sent && new Date(r.reminderTime) > new Date());
    } else if (sent !== undefined) {
      userReminders = userReminders.filter(r => r.sent === (sent === 'true'));
    }

    // Sort by reminder time
    userReminders.sort((a, b) => 
      new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime()
    );

    return NextResponse.json({
      success: true,
      reminders: userReminders,
      count: userReminders.length,
      upcoming: userReminders.filter(r => !r.sent && new Date(r.reminderTime) > new Date()).length,
    });
  } catch (error) {
    console.error('Reminders API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reminders',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reminders
 * Delete a reminder
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Reminder ID is required' },
        { status: 400 }
      );
    }

    if (reminders.has(id)) {
      reminders.delete(id);
      return NextResponse.json({
        success: true,
        message: 'Reminder deleted',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Reminder not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Reminders API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete reminder',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reminders
 * Update a reminder (enable/disable or mark as sent)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, enabled, sent, message, reminderTime } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Reminder ID is required' },
        { status: 400 }
      );
    }

    const reminder = reminders.get(id);
    if (!reminder) {
      return NextResponse.json(
        { success: false, error: 'Reminder not found' },
        { status: 404 }
      );
    }

    if (enabled !== undefined) {
      reminder.enabled = enabled;
    }

    if (sent !== undefined) {
      reminder.sent = sent;
      if (sent) {
        reminder.sentAt = new Date().toISOString();
      }
    }

    if (message) {
      reminder.message = message;
    }

    if (reminderTime) {
      const reminderDate = new Date(reminderTime);
      if (isNaN(reminderDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid reminderTime format' },
          { status: 400 }
        );
      }
      reminder.reminderTime = reminderDate.toISOString();
    }

    reminders.set(id, reminder);

    return NextResponse.json({
      success: true,
      reminder,
      message: 'Reminder updated',
    });
  } catch (error) {
    console.error('Reminders API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update reminder',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

