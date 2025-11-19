import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-volatility-forecast/[address]
 * Forecast future volatility based on historical patterns
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
    const cacheKey = `onchain-volatility-forecast:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const forecast: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      currentVolatility: 0,
      forecastedVolatility: 0,
      trend: 'stable',
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
          const priceChange = Math.abs((prices[0].price - prices[1].price) / prices[1].price);
          forecast.currentVolatility = priceChange * 100;
          forecast.forecastedVolatility = forecast.currentVolatility * 1.1;
          forecast.trend = priceChange > 0.05 ? 'increasing' : 'stable';
        }
      }
    } catch (error) {
      console.error('Error forecasting volatility:', error);
    }

    cache.set(cacheKey, forecast, 5 * 60 * 1000);

    return NextResponse.json(forecast);
  } catch (error) {
    console.error('Volatility forecast error:', error);
    return NextResponse.json(
      {
        error: 'Failed to forecast volatility',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
