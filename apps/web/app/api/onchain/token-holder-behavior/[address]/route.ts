import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-behavior/[address]
 * Analyze holder behavior patterns
 * Identifies trading and holding strategies
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
    const cacheKey = `onchain-holder-behavior:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const behavior: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      behaviorTypes: {
        holders: 0,
        traders: 0,
        accumulators: 0,
      },
      dominantBehavior: 'unknown',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        let holdersCount = 0;
        let tradersCount = 0;

        holders.forEach((holder: any) => {
          const lastTransfer = new Date(holder.last_transferred_at || 0);
          const daysAgo = (Date.now() - lastTransfer.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysAgo > 30) holdersCount++;
          else tradersCount++;
        });

        behavior.behaviorTypes.holders = holdersCount;
        behavior.behaviorTypes.traders = tradersCount;
        behavior.dominantBehavior = holdersCount > tradersCount ? 'holding' : 'trading';
      }
    } catch (error) {
      console.error('Error analyzing behavior:', error);
    }

    cache.set(cacheKey, behavior, 5 * 60 * 1000);

    return NextResponse.json(behavior);
  } catch (error) {
    console.error('Holder behavior error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze holder behavior',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





