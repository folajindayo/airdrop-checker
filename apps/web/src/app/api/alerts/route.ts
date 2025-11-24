import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface Alert {
  id: string;
  type: 'new-airdrop' | 'score-change' | 'snapshot-reminder' | 'claim-available';
  title: string;
  message: string;
  address: string;
  projectId?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  read: boolean;
}

interface AlertsData {
  address: string;
  alerts: Alert[];
  unreadCount: number;
  timestamp: number;
}

// In-memory storage - in production, use a database
const alertsStorage = new Map<string, Alert[]>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address is required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const alerts = alertsStorage.get(normalizedAddress) || [];

    const result: AlertsData = {
      address: normalizedAddress,
      alerts: alerts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      unreadCount: alerts.filter((a) => !a.read).length,
      timestamp: Date.now(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, type, title, message, projectId, priority = 'medium' } = body;

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address is required' },
        { status: 400 }
      );
    }

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Type, title, and message are required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const alerts = alertsStorage.get(normalizedAddress) || [];

    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      address: normalizedAddress,
      projectId,
      priority,
      createdAt: new Date().toISOString(),
      read: false,
    };

    alerts.push(alert);
    alertsStorage.set(normalizedAddress, alerts);

    return NextResponse.json({ success: true, alert });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, alertId, read } = body;

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address is required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const alerts = alertsStorage.get(normalizedAddress) || [];
    
    const alertIndex = alerts.findIndex((a) => a.id === alertId);
    if (alertIndex === -1) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    if (typeof read === 'boolean') {
      alerts[alertIndex].read = read;
    }

    alertsStorage.set(normalizedAddress, alerts);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}
