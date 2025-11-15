import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-trend-analyzer/[address]
 * Analyze token price and volume trends
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
    const cacheKey = `onchain-trend:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const trend: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      trendDirection: 'neutral',
      trendStrength: 0,
      priceChange: 0,
      volumeChange: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const priceChange = parseFloat(response.data.price_change_24h || '0');
        trend.priceChange = priceChange;
        trend.trendDirection = priceChange > 5 ? 'bullish' :
                              priceChange > 0 ? 'slightly_bullish' :
                              priceChange > -5 ? 'neutral' :
                              priceChange > -10 ? 'slightly_bearish' : 'bearish';
        trend.trendStrength = Math.abs(priceChange);
      }
    } catch (error) {
      console.error('Error analyzing trend:', error);
    }

    cache.set(cacheKey, trend, 5 * 60 * 1000);

    return NextResponse.json(trend);
  } catch (error) {
    console.error('Trend analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze trends',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
