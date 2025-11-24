import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-price-momentum-indicator/[address]
 * Calculate price momentum indicators for trend analysis
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
    const cacheKey = `onchain-momentum:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const momentum: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      rsi: 50,
      macd: 0,
      momentumScore: 0,
      trend: 'neutral',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data && response.data.prices) {
        const prices = response.data.prices;
        if (prices.length > 1) {
          const priceChange = (prices[0].price - prices[1].price) / prices[1].price;
          momentum.momentumScore = priceChange > 0 ? 60 : 40;
          momentum.trend = priceChange > 0.05 ? 'bullish' : priceChange < -0.05 ? 'bearish' : 'neutral';
        }
      }
    } catch (error) {
      console.error('Error calculating momentum:', error);
    }

    cache.set(cacheKey, momentum, 2 * 60 * 1000);

    return NextResponse.json(momentum);
  } catch (error) {
    console.error('Price momentum indicator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate price momentum',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
