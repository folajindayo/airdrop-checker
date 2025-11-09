import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface TelegramBot {
  id: string;
  address: string;
  botToken: string;
  chatId: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

// In-memory storage (in production, use database)
const telegramBots: Map<string, TelegramBot[]> = new Map();

/**
 * POST /api/integrations/telegram
 * Configure Telegram bot integration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, botToken, chatId, events } = body;

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address required' },
        { status: 400 }
      );
    }

    if (!botToken || !botToken.match(/^\d+:[A-Za-z0-9_-]+$/)) {
      return NextResponse.json(
        { error: 'Valid Telegram bot token required' },
        { status: 400 }
      );
    }

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID required' },
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
    const userBots = telegramBots.get(normalizedAddress) || [];

    // Limit to 5 Telegram bots per address
    if (userBots.length >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 Telegram bots per address' },
        { status: 400 }
      );
    }

    // Test bot token
    try {
      const testResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      if (!testResponse.ok) {
        return NextResponse.json(
          { error: 'Invalid bot token' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to verify bot token' },
        { status: 400 }
      );
    }

    const bot: TelegramBot = {
      id: `${normalizedAddress}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      address: normalizedAddress,
      botToken,
      chatId,
      events,
      active: true,
      createdAt: new Date().toISOString(),
    };

    userBots.push(bot);
    telegramBots.set(normalizedAddress, userBots);

    // Send test message
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '✅ Airdrop Finder Telegram integration configured successfully!',
        }),
      });
    } catch (error) {
      console.error('Telegram test message failed:', error);
    }

    return NextResponse.json({
      success: true,
      bot: {
        id: bot.id,
        chatId: bot.chatId,
        events: bot.events,
        active: bot.active,
        createdAt: bot.createdAt,
        // Don't expose bot token for security
      },
      message: 'Telegram integration configured successfully',
    });
  } catch (error) {
    console.error('Telegram integration API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to configure Telegram integration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/integrations/telegram
 * Get Telegram bots for an address
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
    const bots = telegramBots.get(normalizedAddress) || [];

    return NextResponse.json({
      success: true,
      bots: bots.map((b) => ({
        id: b.id,
        chatId: b.chatId,
        events: b.events,
        active: b.active,
        createdAt: b.createdAt,
      })),
      count: bots.length,
    });
  } catch (error) {
    console.error('Telegram integration API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Telegram integrations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

