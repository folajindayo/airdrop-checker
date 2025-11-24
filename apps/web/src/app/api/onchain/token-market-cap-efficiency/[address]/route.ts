import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-market-cap-efficiency/[address]
 * Calculate market capitalization efficiency metrics
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
    const cacheKey = `onchain-mcap-efficiency:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const efficiency: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      marketCap: 0,
      liquidityRatio: 0,
      efficiencyScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        efficiency.marketCap = parseFloat(response.data.market_cap_quote || '0');
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        efficiency.liquidityRatio = efficiency.marketCap > 0 ? 
          (liquidity / efficiency.marketCap) * 100 : 0;
        efficiency.efficiencyScore = Math.min(100, efficiency.liquidityRatio * 10);
      }
    } catch (error) {
      console.error('Error calculating efficiency:', error);
    }

    cache.set(cacheKey, efficiency, 2 * 60 * 1000);

    return NextResponse.json(efficiency);
  } catch (error) {
    console.error('Market cap efficiency error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate market cap efficiency',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
