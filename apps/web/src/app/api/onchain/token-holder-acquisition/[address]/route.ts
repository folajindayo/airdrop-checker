import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-acquisition/[address]
 * Track new holder acquisition rate
 * Measures growth in holder base
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
    const cacheKey = `onchain-holder-acquisition:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const acquisition: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      newHolders: 0,
      acquisitionRate: 0,
      growthTrend: 'stable',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const newOnes = holders.filter((h: any) => {
          const lastTransfer = new Date(h.last_transferred_at || 0);
          const daysAgo = (Date.now() - lastTransfer.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo < 30;
        });

        acquisition.newHolders = newOnes.length;
        acquisition.acquisitionRate = holders.length > 0 ? 
          (newOnes.length / holders.length) * 100 : 0;
        acquisition.growthTrend = acquisition.acquisitionRate > 20 ? 'growing' :
                                  acquisition.acquisitionRate > 10 ? 'stable' : 'declining';
      }
    } catch (error) {
      console.error('Error tracking acquisition:', error);
    }

    cache.set(cacheKey, acquisition, 5 * 60 * 1000);

    return NextResponse.json(acquisition);
  } catch (error) {
    console.error('Holder acquisition error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track holder acquisition',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

