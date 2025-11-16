import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-trading-volume-trend/[address]
 * Analyze trading volume trends
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
    const cacheKey = `onchain-volume-trend:${normalizedAddress}:${chainId || 'all'}`;
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
      volume24h: 0,
      trendDirection: 'neutral',
      trendStrength: 0,
      volumeChange: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const volume = parseFloat(response.data.volume_24h || '0');
        trend.volume24h = volume;
        trend.trendDirection = volume > 1000000 ? 'increasing' :
                              volume > 100000 ? 'stable' : 'decreasing';
        trend.trendStrength = Math.min((volume / 1000000) * 100, 100);
      }
    } catch (error) {
      console.error('Error analyzing trend:', error);
    }

    cache.set(cacheKey, trend, 5 * 60 * 1000);

    return NextResponse.json(trend);
  } catch (error) {
    console.error('Volume trend error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze volume trend',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

