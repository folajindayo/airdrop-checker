import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface DiscordWebhook {
  id: string;
  address: string;
  webhookUrl: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

// In-memory storage (in production, use database)
const discordWebhooks: Map<string, DiscordWebhook[]> = new Map();

/**
 * POST /api/integrations/discord
 * Configure Discord webhook integration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, webhookUrl, events } = body;

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address required' },
        { status: 400 }
      );
    }

    if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      return NextResponse.json(
        { error: 'Valid Discord webhook URL required' },
        { status: 400 }
      );
    }

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'events array is required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const userWebhooks = discordWebhooks.get(normalizedAddress) || [];

    // Limit to 5 Discord webhooks per address
    if (userWebhooks.length >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 Discord webhooks per address' },
        { status: 400 }
      );
    }

    const webhook: DiscordWebhook = {
      id: `${normalizedAddress}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      address: normalizedAddress,
      webhookUrl,
      events,
      active: true,
      createdAt: new Date().toISOString(),
    };

    userWebhooks.push(webhook);
    discordWebhooks.set(normalizedAddress, userWebhooks);

    // Test webhook
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '✅ Airdrop Finder Discord integration configured successfully!',
        }),
      });
    } catch (error) {
      console.error('Discord webhook test failed:', error);
    }

    return NextResponse.json({
      success: true,
      webhook,
      message: 'Discord integration configured successfully',
    });
  } catch (error) {
    console.error('Discord integration API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to configure Discord integration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/integrations/discord
 * Get Discord webhooks for an address
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
    const webhooks = discordWebhooks.get(normalizedAddress) || [];

    return NextResponse.json({
      success: true,
      webhooks: webhooks.map((w) => ({
        id: w.id,
        events: w.events,
        active: w.active,
        createdAt: w.createdAt,
        // Don't expose full webhook URL for security
        webhookUrl: w.webhookUrl.slice(0, 30) + '...',
      })),
      count: webhooks.length,
    });
  } catch (error) {
    console.error('Discord integration API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Discord integrations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



