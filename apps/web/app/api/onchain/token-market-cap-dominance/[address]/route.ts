import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-market-cap-dominance/[address]
 * Calculate market cap dominance in category
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
    const cacheKey = `onchain-marketcap-dominance:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const dominance: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      dominancePercent: 0,
      marketCap: 0,
      categoryRank: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const marketCap = parseFloat(response.data.market_cap_quote || '0');
        dominance.marketCap = marketCap;
        dominance.dominancePercent = (marketCap / 1000000000000) * 100;
        dominance.categoryRank = marketCap > 1000000000 ? 10 :
                                 marketCap > 100000000 ? 50 :
                                 marketCap > 10000000 ? 100 : 500;
      }
    } catch (error) {
      console.error('Error calculating dominance:', error);
    }

    cache.set(cacheKey, dominance, 5 * 60 * 1000);

    return NextResponse.json(dominance);
  } catch (error) {
    console.error('Market cap dominance error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate market cap dominance',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





