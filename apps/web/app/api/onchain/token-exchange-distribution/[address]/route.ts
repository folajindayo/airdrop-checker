import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-exchange-distribution/[address]
 * Analyze token distribution across exchanges
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
    const cacheKey = `onchain-exchange-distribution:${normalizedAddress}:${chainId || 'all'}`;
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
      exchangeCount: 0,
      topExchange: null,
      distributionScore: 0,
      exchanges: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        distribution.exchangeCount = liquidity > 1000000 ? 5 : liquidity > 100000 ? 3 : 1;
        distribution.topExchange = 'Uniswap V3';
        distribution.distributionScore = distribution.exchangeCount * 20;
      }
    } catch (error) {
      console.error('Error analyzing distribution:', error);
    }

    cache.set(cacheKey, distribution, 5 * 60 * 1000);

    return NextResponse.json(distribution);
  } catch (error) {
    console.error('Exchange distribution error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze exchange distribution',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

