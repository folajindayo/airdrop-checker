import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-trading-intensity/[address]
 * Measure trading intensity and frequency
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
    const cacheKey = `onchain-trading-intensity:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const intensity: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      tradingIntensity: 0,
      averageTradeSize: 0,
      tradeFrequency: 'medium',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const volume24h = parseFloat(response.data.volume_24h || '0');
        const txCount = parseFloat(response.data.transactions_24h || '1');
        intensity.averageTradeSize = volume24h / txCount;
        intensity.tradingIntensity = volume24h;
        intensity.tradeFrequency = txCount > 1000 ? 'high' :
                                  txCount > 100 ? 'medium' : 'low';
      }
    } catch (error) {
      console.error('Error measuring intensity:', error);
    }

    cache.set(cacheKey, intensity, 5 * 60 * 1000);

    return NextResponse.json(intensity);
  } catch (error) {
    console.error('Trading intensity error:', error);
    return NextResponse.json(
      {
        error: 'Failed to measure trading intensity',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





