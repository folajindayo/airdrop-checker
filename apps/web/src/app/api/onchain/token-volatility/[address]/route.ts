import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-volatility/[address]
 * Calculate token price volatility metrics
 * Analyzes historical price movements for risk assessment
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
    const cacheKey = `onchain-token-volatility:${normalizedAddress}:${chainId || 'all'}:${days}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const volatility: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      period: `${days} days`,
      metrics: {
        dailyVolatility: 0,
        weeklyVolatility: 0,
        monthlyVolatility: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
      },
      priceHistory: [] as number[],
      riskLevel: 'medium',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.prices) {
        const prices = response.data.prices.slice(-days);
        volatility.priceHistory = prices.map((p: any) => parseFloat(p.price || '0'));
        
        if (volatility.priceHistory.length > 1) {
          volatility.metrics.dailyVolatility = calculateVolatility(volatility.priceHistory, 1);
          volatility.metrics.weeklyVolatility = calculateVolatility(volatility.priceHistory, 7);
          volatility.metrics.maxDrawdown = calculateMaxDrawdown(volatility.priceHistory);
          volatility.riskLevel = assessRiskLevel(volatility.metrics);
        }
      }
    } catch (error) {
      console.error('Error calculating volatility:', error);
    }

    cache.set(cacheKey, volatility, 5 * 60 * 1000);

    return NextResponse.json(volatility);
  } catch (error) {
    console.error('Token volatility calculation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate token volatility',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function calculateVolatility(prices: number[], period: number): number {
  if (prices.length < period + 1) return 0;

  const returns: number[] = [];
  for (let i = period; i < prices.length; i++) {
    const return_ = (prices[i] - prices[i - period]) / prices[i - period];
    returns.push(return_);
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance) * 100;
}

function calculateMaxDrawdown(prices: number[]): number {
  let maxDrawdown = 0;
  let peak = prices[0];

  for (const price of prices) {
    if (price > peak) peak = price;
    const drawdown = ((peak - price) / peak) * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  return maxDrawdown;
}

function assessRiskLevel(metrics: any): string {
  const avgVolatility = (metrics.dailyVolatility + metrics.weeklyVolatility) / 2;
  
  if (avgVolatility > 50) return 'very_high';
  if (avgVolatility > 30) return 'high';
  if (avgVolatility > 15) return 'medium';
  return 'low';
}

