import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-market-cap-efficiency/[address]
 * Measure market cap efficiency metrics
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
    const cacheKey = `onchain-marketcap-efficiency:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const efficiency: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      efficiencyScore: 0,
      volumeToMarketCapRatio: 0,
      liquidityToMarketCapRatio: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const marketCap = parseFloat(response.data.market_cap_quote || '0');
        const volume = parseFloat(response.data.volume_24h || '0');
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        efficiency.volumeToMarketCapRatio = marketCap > 0 ? (volume / marketCap) * 100 : 0;
        efficiency.liquidityToMarketCapRatio = marketCap > 0 ? (liquidity / marketCap) * 100 : 0;
        efficiency.efficiencyScore = (efficiency.volumeToMarketCapRatio + efficiency.liquidityToMarketCapRatio) / 2;
      }
    } catch (error) {
      console.error('Error measuring efficiency:', error);
    }

    cache.set(cacheKey, efficiency, 5 * 60 * 1000);

    return NextResponse.json(efficiency);
  } catch (error) {
    console.error('Market cap efficiency error:', error);
    return NextResponse.json(
      {
        error: 'Failed to measure market cap efficiency',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

