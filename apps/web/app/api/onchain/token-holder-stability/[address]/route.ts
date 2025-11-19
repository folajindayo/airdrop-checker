import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-stability/[address]
 * Measure holder stability index
 * Tracks how stable the holder base is
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
    const cacheKey = `onchain-holder-stability:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const stability: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      stabilityIndex: 0,
      stableHolders: 0,
      volatility: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const stable = holders.filter((h: any) => {
          const lastTransfer = new Date(h.last_transferred_at || 0);
          const daysAgo = (Date.now() - lastTransfer.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo > 60;
        });

        stability.stableHolders = stable.length;
        stability.stabilityIndex = holders.length > 0 ? 
          (stable.length / holders.length) * 100 : 0;
        stability.volatility = 100 - stability.stabilityIndex;
      }
    } catch (error) {
      console.error('Error measuring stability:', error);
    }

    cache.set(cacheKey, stability, 5 * 60 * 1000);

    return NextResponse.json(stability);
  } catch (error) {
    console.error('Holder stability error:', error);
    return NextResponse.json(
      {
        error: 'Failed to measure holder stability',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





