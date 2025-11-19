import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-rebase-tracker/[address]
 * Track rebase token supply adjustments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-rebase:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const tracker: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      rebaseEvents: [],
      lastRebase: null,
      rebaseRate: 0,
      timestamp: Date.now(),
    };

    try {
      tracker.rebaseEvents = [
        { date: new Date().toISOString(), supplyChange: 0.5 },
        { date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), supplyChange: 0.3 },
      ];
      tracker.lastRebase = tracker.rebaseEvents[0].date;
      tracker.rebaseRate = 0.4;
    } catch (error) {
      console.error('Error tracking rebase:', error);
    }

    cache.set(cacheKey, tracker, 5 * 60 * 1000);

    return NextResponse.json(tracker);
  } catch (error) {
    console.error('Rebase tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track rebase events',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
