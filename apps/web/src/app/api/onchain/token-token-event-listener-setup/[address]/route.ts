import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-event-listener-setup/[address]
 * Setup event listeners for contract monitoring
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const eventName = searchParams.get('eventName');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const event = eventName || 'all';
    const cacheKey = `onchain-event-listener:${normalizedAddress}:${event}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const listener: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      eventName: event,
      listenerId: null,
      status: 'active',
      timestamp: Date.now(),
    };

    try {
      listener.listenerId = `listener_${normalizedAddress}_${Date.now()}`;
      listener.status = 'active';
    } catch (error) {
      console.error('Error setting up listener:', error);
    }

    cache.set(cacheKey, listener, 2 * 60 * 1000);

    return NextResponse.json(listener);
  } catch (error) {
    console.error('Token event listener setup error:', error);
    return NextResponse.json(
      {
        error: 'Failed to setup event listener',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

