import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface GasPricePoint {
  timestamp: number;
  date: string;
  gasPrice: number; // in gwei
  chainId: number;
  chainName: string;
}

interface GasHistoryData {
  chains: Record<number, {
    chainId: number;
    chainName: string;
    dataPoints: GasPricePoint[];
    average: number;
    min: number;
    max: number;
    current: number;
  }>;
  bestTimes: Array<{
    chainId: number;
    chainName: string;
    time: string;
    averageGas: number;
  }>;
  timestamp: number;
}

// Mock historical gas data - in production, fetch from gas price APIs
function generateMockGasHistory(chainId: number, days: number = 30): GasPricePoint[] {
  const basePrices: Record<number, number> = {
    1: 30, // Ethereum
    8453: 0.1, // Base
    42161: 0.2, // Arbitrum
    10: 0.15, // Optimism
    324: 0.3, // zkSync
    137: 40, // Polygon
  };

  const basePrice = basePrices[chainId] || 20;
  const dataPoints: GasPricePoint[] = [];
  const now = Date.now();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    // Simulate daily variation
    const variation = (Math.sin(i / 7) * 0.3 + Math.random() * 0.2 - 0.1);
    const gasPrice = basePrice * (1 + variation);

    dataPoints.push({
      timestamp: date.getTime(),
      date: date.toISOString().split('T')[0],
      gasPrice: Math.max(0.01, gasPrice),
      chainId,
    });
  }

  return dataPoints;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get('chainId');
    const days = parseInt(searchParams.get('days') || '30');

    const cacheKey = `gas-history:${chainId || 'all'}:${days}`;
    const cachedResult = cache.get<GasHistoryData>(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const chains: Record<number, any> = {};
    const chainsToProcess = chainId
      ? SUPPORTED_CHAINS.filter((c) => c.id === parseInt(chainId))
      : SUPPORTED_CHAINS;

    chainsToProcess.forEach((chain) => {
      const dataPoints = generateMockGasHistory(chain.id, days);
      const prices = dataPoints.map((dp) => dp.gasPrice);
      const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const current = prices[prices.length - 1];

      chains[chain.id] = {
        chainId: chain.id,
        chainName: chain.name,
        dataPoints,
        average,
        min,
        max,
        current,
      };
    });

    // Find best times (lowest average gas)
    const bestTimes = Object.values(chains)
      .map((chain) => {
        // Group by hour of day
        const hourlyAverages = new Map<number, number[]>();
        
        chain.dataPoints.forEach((dp) => {
          const hour = new Date(dp.timestamp).getHours();
          if (!hourlyAverages.has(hour)) {
            hourlyAverages.set(hour, []);
          }
          hourlyAverages.get(hour)!.push(dp.gasPrice);
        });

        let bestHour = 0;
        let bestAvg = Infinity;

        hourlyAverages.forEach((prices, hour) => {
          const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
          if (avg < bestAvg) {
            bestAvg = avg;
            bestHour = hour;
          }
        });

        return {
          chainId: chain.chainId,
          chainName: chain.chainName,
          time: `${String(bestHour).padStart(2, '0')}:00 UTC`,
          averageGas: bestAvg,
        };
      })
      .sort((a, b) => a.averageGas - b.averageGas)
      .slice(0, 5);

    const result: GasHistoryData = {
      chains,
      bestTimes,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 30 * 60 * 1000); // Cache for 30 minutes

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching gas history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gas history' },
      { status: 500 }
    );
  }
}

