import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface Alert {
  id: string;
  type: 'error_rate' | 'response_time' | 'uptime' | 'cache_hit_rate' | 'custom';
  condition: string;
  threshold: number;
  active: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

// In-memory storage (in production, use database)
const alerts: Alert[] = [];

/**
 * GET /api/monitor/alerts
 * Get monitoring alerts
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      alerts,
      activeAlerts: alerts.filter((a) => a.active),
      totalAlerts: alerts.length,
    });
  } catch (error) {
    console.error('Monitor alerts API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch alerts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/monitor/alerts
 * Create a monitoring alert
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, condition, threshold } = body;

    if (!type || !condition || threshold === undefined) {
      return NextResponse.json(
        { error: 'type, condition, and threshold are required' },
        { status: 400 }
      );
    }

    const validTypes = ['error_rate', 'response_time', 'uptime', 'cache_hit_rate', 'custom'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid alert type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      condition,
      threshold,
      active: true,
      triggerCount: 0,
    };

    alerts.push(alert);

    return NextResponse.json({
      success: true,
      alert,
      message: 'Alert created successfully',
    });
  } catch (error) {
    console.error('Monitor alerts API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create alert',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/monitor/alerts
 * Delete a monitoring alert
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID required' },
        { status: 400 }
      );
    }

    const index = alerts.findIndex((a) => a.id === alertId);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    alerts.splice(index, 1);

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    console.error('Monitor alerts API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete alert',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



