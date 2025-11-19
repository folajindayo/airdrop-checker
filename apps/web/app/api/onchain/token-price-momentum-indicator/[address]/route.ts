import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-price-momentum-indicator/[address]
 * Calculate price momentum indicators
 * RSI and trend analysis
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
    const cacheKey = `onchain-momentum:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const momentum: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      rsi: 50,
      trend: 'neutral',
      momentumScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 30 }
      );

      if (response.data?.items) {
        const transactions = response.data.items;
        const prices = transactions
          .map((tx: any) => parseFloat(tx.value_quote || '0'))
          .filter((p: number) => p > 0)
          .slice(0, 14);
        
        if (prices.length > 1) {
          const gains = [];
          const losses = [];
          
          for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) gains.push(change);
            else losses.push(Math.abs(change));
          }
          
          const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / gains.length : 0;
          const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
          
          if (avgLoss > 0) {
            const rs = avgGain / avgLoss;
            momentum.rsi = 100 - (100 / (1 + rs));
          }
          
          const recentTrend = prices[prices.length - 1] - prices[0];
          if (recentTrend > 0) momentum.trend = 'bullish';
          else if (recentTrend < 0) momentum.trend = 'bearish';
          
          momentum.momentumScore = momentum.rsi;
        }
      }
    } catch (error) {
      console.error('Error calculating momentum:', error);
    }

    cache.set(cacheKey, momentum, 5 * 60 * 1000);

    return NextResponse.json(momentum);
  } catch (error) {
    console.error('Momentum indicator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate momentum indicators',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

