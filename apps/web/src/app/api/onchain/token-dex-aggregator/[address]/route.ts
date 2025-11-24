import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-dex-aggregator/[address]
 * Aggregate DEX prices and liquidity across multiple exchanges
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
    const cacheKey = `onchain-dex-aggregator:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const aggregation: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      dexPrices: [],
      bestPrice: null,
      totalLiquidity: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        aggregation.bestPrice = parseFloat(response.data.prices?.[0]?.price || '0');
        aggregation.totalLiquidity = parseFloat(response.data.total_liquidity_quote || '0');
      }
    } catch (error) {
      console.error('Error aggregating DEX data:', error);
    }

    cache.set(cacheKey, aggregation, 2 * 60 * 1000);

    return NextResponse.json(aggregation);
  } catch (error) {
    console.error('DEX aggregator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to aggregate DEX data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






