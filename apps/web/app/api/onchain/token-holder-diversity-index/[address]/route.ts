import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-diversity-index/[address]
 * Calculate holder diversity index
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
    const cacheKey = `onchain-diversity-index:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const diversity: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      diversityIndex: 0,
      holderDistribution: 0,
      concentrationRisk: 'medium',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const totalBalance = holders.reduce((sum: number, h: any) => 
          sum + parseFloat(h.balance || '0'), 0);
        const top5Balance = holders.slice(0, 5).reduce((sum: number, h: any) => 
          sum + parseFloat(h.balance || '0'), 0);
        const top5Percent = totalBalance > 0 ? (top5Balance / totalBalance) * 100 : 0;
        diversity.diversityIndex = Math.max(0, 100 - top5Percent);
        diversity.concentrationRisk = top5Percent > 50 ? 'high' :
                                     top5Percent > 30 ? 'medium' : 'low';
      }
    } catch (error) {
      console.error('Error calculating diversity:', error);
    }

    cache.set(cacheKey, diversity, 5 * 60 * 1000);

    return NextResponse.json(diversity);
  } catch (error) {
    console.error('Diversity index error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate diversity index',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

