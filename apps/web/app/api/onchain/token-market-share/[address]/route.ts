import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-market-share/[address]
 * Calculate token market share in category
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
    const cacheKey = `onchain-market-share:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const marketShare: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      marketCap: 0,
      marketSharePercent: 0,
      rank: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        marketShare.marketCap = parseFloat(response.data.market_cap_quote || '0');
        marketShare.marketSharePercent = marketShare.marketCap > 0 ? 
          (marketShare.marketCap / 1000000000000) * 100 : 0;
      }
    } catch (error) {
      console.error('Error calculating market share:', error);
    }

    cache.set(cacheKey, marketShare, 5 * 60 * 1000);

    return NextResponse.json(marketShare);
  } catch (error) {
    console.error('Market share error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate market share',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





