import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface Alert {
  id: string;
  address: string;
  email?: string;
  airdropId?: string;
  alertType: 'new_airdrop' | 'eligibility_change' | 'claim_available' | 'snapshot_coming';
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
}

// In-memory storage (in production, use database)
const alerts: Map<string, Alert[]> = new Map();

/**
 * GET /api/alerts
 * Get alerts for an address
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address parameter required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const userAlerts = alerts.get(normalizedAddress) || [];

    return NextResponse.json({
      success: true,
      alerts: userAlerts,
      count: userAlerts.length,
    });
  } catch (error) {
    console.error('Alerts API error:', error);
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
 * POST /api/alerts
 * Create a new alert
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, email, airdropId, alertType } = body;

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address required' },
        { status: 400 }
      );
    }

    if (!alertType || !['new_airdrop', 'eligibility_change', 'claim_available', 'snapshot_coming'].includes(alertType)) {
      return NextResponse.json(
        { error: 'Valid alertType required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const alert: Alert = {
      id: `${normalizedAddress}-${Date.now()}`,
      address: normalizedAddress,
      email: email || undefined,
      airdropId: airdropId || undefined,
      alertType,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    const userAlerts = alerts.get(normalizedAddress) || [];
    userAlerts.push(alert);
    alerts.set(normalizedAddress, userAlerts);

    return NextResponse.json({
      success: true,
      alert,
      message: 'Alert created successfully',
    });
  } catch (error) {
    console.error('Alerts API error:', error);
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
 * DELETE /api/alerts
 * Delete an alert
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const alertId = searchParams.get('id');

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address parameter required' },
        { status: 400 }
      );
    }

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const userAlerts = alerts.get(normalizedAddress) || [];
    const filtered = userAlerts.filter((a) => a.id !== alertId);

    if (filtered.length === userAlerts.length) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    alerts.set(normalizedAddress, filtered);

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    console.error('Alerts API error:', error);
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

