import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-trading-volume/[address]
 * Analyze token trading volume patterns
 * Tracks volume trends and liquidity
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-trading-volume:${normalizedAddress}:${chainId || 'all'}:${days}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const volume: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      period: `${days} days`,
      totalVolume: 0,
      averageDailyVolume: 0,
      volumeTrend: 'stable',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        volume.totalVolume = parseFloat(response.data.total_volume_24h_quote || '0');
        volume.averageDailyVolume = volume.totalVolume / days;
        volume.volumeTrend = volume.averageDailyVolume > 100000 ? 'high' : 
                            volume.averageDailyVolume > 10000 ? 'medium' : 'low';
      }
    } catch (error) {
      console.error('Error analyzing volume:', error);
    }

    cache.set(cacheKey, volume, 5 * 60 * 1000);

    return NextResponse.json(volume);
  } catch (error) {
    console.error('Trading volume analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze trading volume',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
