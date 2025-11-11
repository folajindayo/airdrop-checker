import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface WebhookEvent {
  id: string;
  webhookId: string;
  address: string;
  eventType: string;
  payload: any;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  createdAt: string;
  deliveredAt?: string;
  error?: string;
}

// In-memory storage (in production, use database)
const webhookEvents: Map<string, WebhookEvent[]> = new Map();

/**
 * GET /api/webhooks/events
 * Get webhook event history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const webhookId = searchParams.get('webhookId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address parameter required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    let events = webhookEvents.get(normalizedAddress) || [];

    // Filter by webhook ID if provided
    if (webhookId) {
      events = events.filter((e) => e.webhookId === webhookId);
    }

    // Filter by status if provided
    if (status) {
      events = events.filter((e) => e.status === status);
    }

    // Sort by creation date (newest first)
    events.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply limit
    const limitedEvents = events.slice(0, limit);

    // Calculate statistics
    const stats = {
      total: events.length,
      pending: events.filter((e) => e.status === 'pending').length,
      delivered: events.filter((e) => e.status === 'delivered').length,
      failed: events.filter((e) => e.status === 'failed').length,
      successRate: events.length > 0
        ? (events.filter((e) => e.status === 'delivered').length / events.length) * 100
        : 0,
    };

    return NextResponse.json({
      success: true,
      events: limitedEvents,
      stats,
      pagination: {
        total: events.length,
        returned: limitedEvents.length,
        hasMore: events.length > limit,
      },
    });
  } catch (error) {
    console.error('Webhook events API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch webhook events',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to log webhook event
 */
export function logWebhookEvent(
  webhookId: string,
  address: string,
  eventType: string,
  payload: any,
  status: 'pending' | 'delivered' | 'failed',
  error?: string
) {
  const normalizedAddress = address.toLowerCase();
  const events = webhookEvents.get(normalizedAddress) || [];

  const event: WebhookEvent = {
    id: `${normalizedAddress}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    webhookId,
    address: normalizedAddress,
    eventType,
    payload,
    status,
    attempts: 1,
    createdAt: new Date().toISOString(),
    deliveredAt: status === 'delivered' ? new Date().toISOString() : undefined,
    error,
  };

  events.push(event);
  webhookEvents.set(normalizedAddress, events);
}



