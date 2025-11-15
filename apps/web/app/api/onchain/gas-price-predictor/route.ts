import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

export const dynamic = 'force-dynamic';

const chainMap: Record<number, any> = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
};

/**
 * GET /api/onchain/gas-price-predictor
 * Predict future gas prices based on historical patterns
 * Uses on-chain data via Reown Wallet integration
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId') || '1';
    const hours = parseInt(searchParams.get('hours') || '24');

    const cacheKey = `onchain-gas-predictor:${chainId}:${hours}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);
    const chain = chainMap[targetChainId] || mainnet;

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    const currentBlock = await publicClient.getBlockNumber();
    const blocksToAnalyze = Math.min(100, Math.floor(hours * 60 / 12));

    const gasPrices: bigint[] = [];
    const priorityFees: bigint[] = [];

    for (let i = 0; i < blocksToAnalyze; i++) {
      try {
        const blockNumber = currentBlock - BigInt(i);
        const block = await publicClient.getBlock({ blockNumber });

        if (block.baseFeePerGas) {
          gasPrices.push(block.baseFeePerGas);
        }
      } catch (error) {
        console.error(`Error fetching block ${currentBlock - BigInt(i)}:`, error);
      }
    }

    const predictions = calculatePredictions(gasPrices, priorityFees);

    const result = {
      chainId: targetChainId,
      chainName: chain.name,
      currentGasPrice: gasPrices[0] ? gasPrices[0].toString() : '0',
      predictions: {
        nextHour: predictions.nextHour,
        next24Hours: predictions.next24Hours,
        nextWeek: predictions.nextWeek,
        confidence: predictions.confidence,
      },
      historical: {
        average: predictions.average,
        min: predictions.min,
        max: predictions.max,
        trend: predictions.trend,
      },
      recommendations: generateGasRecommendations(predictions),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 1 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Gas price prediction error:', error);
    return NextResponse.json(
      {
        error: 'Failed to predict gas prices',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function calculatePredictions(gasPrices: bigint[], priorityFees: bigint[]) {
  if (gasPrices.length === 0) {
    return {
      nextHour: '0',
      next24Hours: '0',
      nextWeek: '0',
      confidence: 0,
      average: '0',
      min: '0',
      max: '0',
      trend: 'stable',
    };
  }

  const prices = gasPrices.map(p => Number(p));
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  const recent = prices.slice(0, 10);
  const older = prices.slice(10);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;

  const trend = recentAvg > olderAvg * 1.1 ? 'increasing' : 
                recentAvg < olderAvg * 0.9 ? 'decreasing' : 'stable';

  const volatility = calculateVolatility(prices);
  const confidence = Math.max(0, Math.min(100, 100 - volatility * 10));

  const nextHour = trend === 'increasing' ? average * 1.05 : 
                   trend === 'decreasing' ? average * 0.95 : average;
  const next24Hours = trend === 'increasing' ? average * 1.15 : 
                      trend === 'decreasing' ? average * 0.85 : average;
  const nextWeek = trend === 'increasing' ? average * 1.3 : 
                   trend === 'decreasing' ? average * 0.7 : average;

  return {
    nextHour: Math.round(nextHour).toString(),
    next24Hours: Math.round(next24Hours).toString(),
    nextWeek: Math.round(nextWeek).toString(),
    confidence: Math.round(confidence),
    average: Math.round(average).toString(),
    min: min.toString(),
    max: max.toString(),
    trend,
  };
}

function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
  return Math.sqrt(variance) / mean;
}

function generateGasRecommendations(predictions: any): string[] {
  const recommendations: string[] = [];

  if (predictions.trend === 'increasing') {
    recommendations.push('Gas prices are rising - consider executing transactions soon');
    recommendations.push('Use Reown wallet to set optimal gas prices');
  } else if (predictions.trend === 'decreasing') {
    recommendations.push('Gas prices are falling - you may want to wait');
  }

  if (predictions.confidence < 50) {
    recommendations.push('High volatility detected - predictions may be less accurate');
  }

  return recommendations;
}

