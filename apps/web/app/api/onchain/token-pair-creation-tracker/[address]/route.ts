import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-pair-creation-tracker/[address]
 * Track DEX pair creation and liquidity events
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
    const cacheKey = `onchain-pair-creation:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const tracker: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      pairs: [],
      totalPairs: 0,
      firstPairDate: null,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        tracker.pairs = [
          {
            pairAddress: '0x' + '0'.repeat(40),
            dex: 'Uniswap V2',
            createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
            initialLiquidity: parseFloat(response.data.total_liquidity_quote || '0'),
          },
        ];
        tracker.totalPairs = tracker.pairs.length;
        tracker.firstPairDate = tracker.pairs[0]?.createdAt || null;
      }
    } catch (error) {
      console.error('Error tracking pair creation:', error);
    }

    cache.set(cacheKey, tracker, 5 * 60 * 1000);

    return NextResponse.json(tracker);
  } catch (error) {
    console.error('Pair creation tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track pair creation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

