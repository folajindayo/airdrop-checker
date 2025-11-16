import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-trading-activity-score/[address]
 * Calculate comprehensive trading activity score
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
    const cacheKey = `onchain-trading-activity:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const activity: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      activityScore: 0,
      volumeScore: 0,
      transactionScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const volume = parseFloat(response.data.volume_24h || '0');
        const txCount = parseFloat(response.data.transactions_24h || '0');
        activity.volumeScore = Math.min((volume / 1000000) * 100, 100);
        activity.transactionScore = Math.min((txCount / 10000) * 100, 100);
        activity.activityScore = (activity.volumeScore + activity.transactionScore) / 2;
      }
    } catch (error) {
      console.error('Error calculating activity:', error);
    }

    cache.set(cacheKey, activity, 5 * 60 * 1000);

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Trading activity error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate trading activity',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

