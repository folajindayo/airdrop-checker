import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-whale-movement-tracker/[address]
 * Track whale wallet movements and large transactions
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
    const cacheKey = `onchain-whale-tracker:${normalizedAddress}:${chainId || 'all'}`;
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
      whaleTransactions: [],
      totalVolume: 0,
      movementScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data && response.data.items) {
        const largeTxs = response.data.items.filter((tx: any) => 
          parseFloat(tx.value_quote || '0') > 100000);
        tracker.whaleTransactions = largeTxs.slice(0, 10);
        tracker.totalVolume = largeTxs.reduce((sum: number, tx: any) => 
          sum + parseFloat(tx.value_quote || '0'), 0);
        tracker.movementScore = Math.min(100, largeTxs.length * 10);
      }
    } catch (error) {
      console.error('Error tracking whale movements:', error);
    }

    cache.set(cacheKey, tracker, 2 * 60 * 1000);

    return NextResponse.json(tracker);
  } catch (error) {
    console.error('Whale movement tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track whale movements',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

