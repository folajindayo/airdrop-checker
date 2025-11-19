import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-value-score/[address]
 * Calculate holder value distribution score
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
    const cacheKey = `onchain-holder-value-score:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const valueScore: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      valueScore: 0,
      averageHolderValue: 0,
      medianHolderValue: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const totalValue = holders.reduce((sum: number, h: any) => 
          sum + parseFloat(h.value || '0'), 0);
        valueScore.averageHolderValue = holders.length > 0 ? totalValue / holders.length : 0;
        valueScore.valueScore = Math.min((valueScore.averageHolderValue / 10000) * 100, 100);
      }
    } catch (error) {
      console.error('Error calculating value score:', error);
    }

    cache.set(cacheKey, valueScore, 5 * 60 * 1000);

    return NextResponse.json(valueScore);
  } catch (error) {
    console.error('Holder value score error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate holder value score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





