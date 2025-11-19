import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-volatility-forecast/[address]
 * Forecast token price volatility
 * Predicts future price movements
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId') || '1';

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-volatility-forecast:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const forecast: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      expectedVolatility: 0,
      volatilityTrend: 'stable',
      riskLevel: 'medium',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const transactions = response.data.items;
        const prices = transactions
          .map((tx: any) => parseFloat(tx.value_quote || '0'))
          .filter((p: number) => p > 0)
          .slice(0, 30);
        
        if (prices.length > 1) {
          const returns = [];
          for (let i = 1; i < prices.length; i++) {
            if (prices[i - 1] > 0) {
              returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
            }
          }
          
          const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
          const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
          forecast.expectedVolatility = Math.sqrt(variance) * 100;
          
          if (forecast.expectedVolatility > 50) forecast.riskLevel = 'high';
          else if (forecast.expectedVolatility < 20) forecast.riskLevel = 'low';
          
          const recentVol = returns.slice(-5).reduce((sum, r) => sum + Math.abs(r), 0) / 5;
          const earlierVol = returns.slice(0, 5).reduce((sum, r) => sum + Math.abs(r), 0) / 5;
          forecast.volatilityTrend = recentVol > earlierVol ? 'increasing' : 'decreasing';
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

