import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-turnover/[address]
 * Calculate holder turnover rate
 * Measures how often holders change
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
    const cacheKey = `onchain-holder-turnover:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const turnover: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      turnoverRate: 0,
      newHolders: 0,
      lostHolders: 0,
      stability: 'stable',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const recent = holders.filter((h: any) => {
          const lastTransfer = new Date(h.last_transferred_at || 0);
          const daysAgo = (Date.now() - lastTransfer.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo < 7;
        });

        turnover.newHolders = recent.length;
        turnover.turnoverRate = holders.length > 0 ? 
          (recent.length / holders.length) * 100 : 0;
        turnover.stability = turnover.turnoverRate > 50 ? 'high' :
                            turnover.turnoverRate > 20 ? 'medium' : 'low';
      }
    } catch (error) {
      console.error('Error calculating turnover:', error);
    }

    cache.set(cacheKey, turnover, 5 * 60 * 1000);

    return NextResponse.json(turnover);
  } catch (error) {
    console.error('Holder turnover error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate holder turnover',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

