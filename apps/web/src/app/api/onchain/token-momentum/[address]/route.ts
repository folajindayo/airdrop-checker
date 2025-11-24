import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-momentum/[address]
 * Calculate token price momentum indicators
 * Identifies trending tokens and momentum shifts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const period = parseInt(searchParams.get('period') || '7');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-token-momentum:${normalizedAddress}:${chainId || 'all'}:${period}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const momentum: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      period: `${period} days`,
      momentumScore: 0,
      indicators: {
        priceChange: 0,
        volumeTrend: 0,
        rsi: 0,
        macd: 0,
      },
      trend: 'neutral',
      signal: 'hold',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.prices) {
        const prices = response.data.prices.slice(-period);
        const priceValues = prices.map((p: any) => parseFloat(p.price || '0'));
        
        if (priceValues.length > 1) {
          const currentPrice = priceValues[priceValues.length - 1];
          const previousPrice = priceValues[0];
          
          momentum.indicators.priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
          momentum.indicators.rsi = calculateRSI(priceValues);
          momentum.momentumScore = calculateMomentumScore(momentum.indicators);
          momentum.trend = determineTrend(momentum.momentumScore);
          momentum.signal = generateSignal(momentum);
        }
      }
    } catch (error) {
      console.error('Error calculating momentum:', error);
    }

    cache.set(cacheKey, momentum, 2 * 60 * 1000);

    return NextResponse.json(momentum);
  } catch (error) {
    console.error('Token momentum calculation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate token momentum',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;

  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const gains = changes.filter(c => c > 0);
  const losses = changes.filter(c => c < 0).map(c => Math.abs(c));

  const avgGain = gains.reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMomentumScore(indicators: any): number {
  let score = 50;

  if (indicators.priceChange > 0) score += indicators.priceChange;
  if (indicators.rsi > 70) score += 10;
  if (indicators.rsi < 30) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function determineTrend(score: number): string {
  if (score > 70) return 'bullish';
  if (score < 30) return 'bearish';
  return 'neutral';
}

function generateSignal(momentum: any): string {
  if (momentum.trend === 'bullish' && momentum.indicators.rsi < 70) return 'buy';
  if (momentum.trend === 'bearish' && momentum.indicators.rsi > 30) return 'sell';
  return 'hold';
}

