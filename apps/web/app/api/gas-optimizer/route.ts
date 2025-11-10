import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface GasPriceData {
  chainId: number;
  chainName: string;
  currentGasPrice: number; // in gwei
  recommendedTime: string;
  estimatedSavings: number; // percentage
  historicalAverage: number;
}

interface GasOptimizerData {
  recommendations: GasPriceData[];
  bestChain: {
    chainId: number;
    chainName: string;
    gasPrice: number;
    savings: number;
  };
  bestTime: {
    time: string;
    savings: number;
  };
  timestamp: number;
}

// Mock gas price data - in production, this would fetch from a gas price API
const MOCK_GAS_PRICES: Record<number, { current: number; average: number; bestTime: string }> = {
  1: { current: 45, average: 35, bestTime: '02:00-06:00 UTC' }, // Ethereum
  8453: { current: 0.1, average: 0.08, bestTime: '00:00-08:00 UTC' }, // Base
  42161: { current: 0.2, average: 0.15, bestTime: '00:00-08:00 UTC' }, // Arbitrum
  10: { current: 0.15, average: 0.12, bestTime: '00:00-08:00 UTC' }, // Optimism
  324: { current: 0.3, average: 0.25, bestTime: '00:00-08:00 UTC' }, // zkSync
  137: { current: 50, average: 40, bestTime: '02:00-06:00 UTC' }, // Polygon
};

export async function GET(request: NextRequest) {
  try {
    const recommendations: GasPriceData[] = SUPPORTED_CHAINS.map((chain) => {
      const gasData = MOCK_GAS_PRICES[chain.id] || {
        current: 50,
        average: 40,
        bestTime: '02:00-06:00 UTC',
      };

      const savings = ((gasData.current - gasData.average) / gasData.current) * 100;

      return {
        chainId: chain.id,
        chainName: chain.name,
        currentGasPrice: gasData.current,
        recommendedTime: gasData.bestTime,
        estimatedSavings: Math.max(0, savings),
        historicalAverage: gasData.average,
      };
    });

    // Find best chain (lowest gas)
    const bestChainData = recommendations.reduce((best, current) => {
      return current.currentGasPrice < best.currentGasPrice ? current : best;
    });

    const bestChain = {
      chainId: bestChainData.chainId,
      chainName: bestChainData.chainName,
      gasPrice: bestChainData.currentGasPrice,
      savings: bestChainData.estimatedSavings,
    };

    // Best time is typically early morning UTC
    const bestTime = {
      time: '00:00-08:00 UTC',
      savings: 20, // Average 20% savings during off-peak
    };

    const result: GasOptimizerData = {
      recommendations: recommendations.sort((a, b) => a.currentGasPrice - b.currentGasPrice),
      bestChain,
      bestTime,
      timestamp: Date.now(),
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error optimizing gas:', error);
    return NextResponse.json(
      { error: 'Failed to optimize gas prices' },
      { status: 500 }
    );
  }
}
