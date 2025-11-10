import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface Webhook {
  id: string;
  address: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
}

// In-memory storage (in production, use database)
const webhooks: Map<string, Webhook[]> = new Map();

/**
 * GET /api/webhooks
 * Get webhooks for an address
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
    const userWebhooks = webhooks.get(normalizedAddress) || [];

    return NextResponse.json({
      success: true,
      webhooks: userWebhooks,
      count: userWebhooks.length,
    });
  } catch (error) {
    console.error('Webhooks API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch webhooks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/webhooks
 * Create a webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, url, events, secret } = body;

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address required' },
        { status: 400 }
      );
    }

    if (!url || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'url and events array are required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate events
    const validEvents = [
      'eligibility_change',
      'new_airdrop',
      'claim_available',
      'snapshot_coming',
      'score_improvement',
    ];
    const invalidEvents = events.filter((e: string) => !validEvents.includes(e));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(', ')}` },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const userWebhooks = webhooks.get(normalizedAddress) || [];

    // Limit to 10 webhooks per address
    if (userWebhooks.length >= 10) {
      return NextResponse.json(
        { error: 'Maximum 10 webhooks per address' },
        { status: 400 }
      );
    }

    const webhook: Webhook = {
      id: `${normalizedAddress}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      address: normalizedAddress,
      url,
      events,
      secret: secret || undefined,
      active: true,
      createdAt: new Date().toISOString(),
    };

    userWebhooks.push(webhook);
    webhooks.set(normalizedAddress, userWebhooks);

    return NextResponse.json({
      success: true,
      webhook,
      message: 'Webhook created successfully',
    });
  } catch (error) {
    console.error('Webhooks API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create webhook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/webhooks
 * Delete a webhook
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const webhookId = searchParams.get('id');

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address parameter required' },
        { status: 400 }
      );
    }

    if (!webhookId) {
      return NextResponse.json(
        { error: 'Webhook ID required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const userWebhooks = webhooks.get(normalizedAddress) || [];
    const filtered = userWebhooks.filter((w) => w.id !== webhookId);

    if (filtered.length === userWebhooks.length) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    webhooks.set(normalizedAddress, filtered);

    return NextResponse.json({
      success: true,
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    console.error('Webhooks API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete webhook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

