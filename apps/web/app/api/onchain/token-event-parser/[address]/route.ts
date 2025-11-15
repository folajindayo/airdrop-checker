import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-event-parser/[address]
 * Parse and decode contract events
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const eventName = searchParams.get('event');

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `event-parser:${address}:${eventName || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const events = {
      contractAddress: address,
      eventName: eventName || 'all',
      parsedEvents: [],
      totalEvents: 0,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, events, 60 * 1000);
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to parse events' },
      { status: 500 }
    );
  }
}

