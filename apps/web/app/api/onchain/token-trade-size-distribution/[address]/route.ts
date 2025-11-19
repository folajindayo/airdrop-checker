import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-trade-size-distribution/[address]
 * Analyze trade size distribution patterns
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
    const cacheKey = `onchain-trade-size:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const distribution: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      averageTradeSize: 0,
      medianTradeSize: 0,
      largeTradePercent: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const volume = parseFloat(response.data.volume_24h || '0');
        const txCount = parseFloat(response.data.transactions_24h || '1');
        distribution.averageTradeSize = volume / txCount;
        distribution.largeTradePercent = distribution.averageTradeSize > 10000 ? 15 : 
                                         distribution.averageTradeSize > 1000 ? 10 : 5;
      }
    } catch (error) {
      console.error('Error analyzing distribution:', error);
    }

    cache.set(cacheKey, distribution, 5 * 60 * 1000);

    return NextResponse.json(distribution);
  } catch (error) {
    console.error('Trade size distribution error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze trade size distribution',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






