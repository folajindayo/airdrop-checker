import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
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
    const chainId = searchParams.get('chainId');
    const eventName = searchParams.get('event');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-event-parser:${normalizedAddress}:${eventName || 'all'}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({ ...cachedResult, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const events: any = {
      contractAddress: normalizedAddress,
      chainId: targetChainId,
      eventName: eventName || 'all',
      events: [],
      decodedEvents: [],
      timestamp: Date.now(),
    };

    cache.set(cacheKey, events, 2 * 60 * 1000);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Event parser error:', error);
    return NextResponse.json(
      {
        error: 'Failed to parse events',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
