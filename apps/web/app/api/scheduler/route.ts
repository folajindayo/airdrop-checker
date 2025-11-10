import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface ScheduledCheck {
  id: string;
  address: string;
  scheduleTime: string; // ISO 8601 timestamp
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  createdAt: string;
  lastRun?: string;
  nextRun: string;
  runCount: number;
}

// In-memory storage (in production, use database)
const scheduledChecks = new Map<string, ScheduledCheck>();

/**
 * POST /api/scheduler
 * Schedule an airdrop check for a specific time
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, scheduleTime, frequency = 'once' } = body;

    if (!address || !scheduleTime) {
      return NextResponse.json(
        { success: false, error: 'Address and scheduleTime are required' },
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
    const scheduleDate = new Date(scheduleTime);
    
    if (isNaN(scheduleDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid scheduleTime format. Use ISO 8601 format.' },
        { status: 400 }
      );
    }

    if (scheduleDate < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Schedule time must be in the future' },
        { status: 400 }
      );
    }

    const id = `${normalizedAddress}-${Date.now()}`;
    const scheduledCheck: ScheduledCheck = {
      id,
      address: normalizedAddress,
      scheduleTime: scheduleDate.toISOString(),
      frequency,
      enabled: true,
      createdAt: new Date().toISOString(),
      nextRun: scheduleDate.toISOString(),
      runCount: 0,
    };

    scheduledChecks.set(id, scheduledCheck);

    return NextResponse.json({
      success: true,
      scheduledCheck,
      message: `Check scheduled for ${scheduleDate.toLocaleString()}`,
    });
  } catch (error) {
    console.error('Scheduler API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to schedule check',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scheduler
 * Get all scheduled checks for an address
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (address) {
      if (!isValidAddress(address)) {
        return NextResponse.json(
          { success: false, error: 'Invalid Ethereum address' },
          { status: 400 }
        );
      }

      const normalizedAddress = address.toLowerCase();
      const checks = Array.from(scheduledChecks.values())
        .filter(check => check.address === normalizedAddress)
        .sort((a, b) => new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime());

      return NextResponse.json({
        success: true,
        checks,
        count: checks.length,
      });
    }

    // Return all checks (admin view)
    const allChecks = Array.from(scheduledChecks.values())
      .sort((a, b) => new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime());

    return NextResponse.json({
      success: true,
      checks: allChecks,
      count: allChecks.length,
    });
  } catch (error) {
    console.error('Scheduler API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch scheduled checks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/scheduler
 * Delete a scheduled check
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    if (scheduledChecks.has(id)) {
      scheduledChecks.delete(id);
      return NextResponse.json({
        success: true,
        message: 'Scheduled check deleted',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Scheduled check not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Scheduler API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete scheduled check',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/scheduler
 * Update a scheduled check (enable/disable or update schedule)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, enabled, scheduleTime, frequency } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    const check = scheduledChecks.get(id);
    if (!check) {
      return NextResponse.json(
        { success: false, error: 'Scheduled check not found' },
        { status: 404 }
      );
    }

    if (enabled !== undefined) {
      check.enabled = enabled;
    }

    if (scheduleTime) {
      const scheduleDate = new Date(scheduleTime);
      if (isNaN(scheduleDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid scheduleTime format' },
          { status: 400 }
        );
      }
      check.scheduleTime = scheduleDate.toISOString();
      check.nextRun = scheduleDate.toISOString();
    }

    if (frequency) {
      check.frequency = frequency;
    }

    scheduledChecks.set(id, check);

    return NextResponse.json({
      success: true,
      scheduledCheck: check,
      message: 'Scheduled check updated',
    });
  } catch (error) {
    console.error('Scheduler API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update scheduled check',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

