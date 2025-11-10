import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface PerformanceDataPoint {
  date: string;
  totalValue: number;
  airdropScore: number;
  transactionCount: number;
  gasSpent: number;
}

interface PortfolioPerformanceData {
  address: string;
  currentValue: number;
  performance: {
    day1: number;
    day7: number;
    day30: number;
    allTime: number;
  };
  dataPoints: PerformanceDataPoint[];
  trends: {
    valueTrend: 'up' | 'down' | 'stable';
    scoreTrend: 'up' | 'down' | 'stable';
    activityTrend: 'up' | 'down' | 'stable';
  };
  timestamp: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `portfolio-performance:${normalizedAddress}`;
    const cachedResult = cache.get<PortfolioPerformanceData>(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    // Fetch current portfolio value
    let currentValue = 0;
    for (const chain of SUPPORTED_CHAINS) {
      try {
        const response = await goldrushClient.get(
          `/${chain.goldrushName}/address/${normalizedAddress}/balances_v2/`
        );
        if (response.data?.items) {
          currentValue += response.data.items.reduce(
            (sum: number, token: any) => sum + (token.quote || 0),
            0
          );
        }
      } catch (error) {
        console.error(`Error fetching balance for ${chain.name}:`, error);
      }
    }

    // Generate historical data points (mock - in production, use historical data)
    const dataPoints: PerformanceDataPoint[] = [];
    const now = Date.now();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      dataPoints.push({
        date: date.toISOString().split('T')[0],
        totalValue: currentValue * (1 + variation * (i / 30)),
        airdropScore: Math.floor(Math.random() * 100),
        transactionCount: Math.floor(Math.random() * 20) + 5,
        gasSpent: Math.random() * 100,
      });
    }

    const day1Value = dataPoints[dataPoints.length - 2]?.totalValue || currentValue;
    const day7Value = dataPoints[dataPoints.length - 8]?.totalValue || currentValue;
    const day30Value = dataPoints[0]?.totalValue || currentValue;

    const performance = {
      day1: ((currentValue - day1Value) / day1Value) * 100,
      day7: ((currentValue - day7Value) / day7Value) * 100,
      day30: ((currentValue - day30Value) / day30Value) * 100,
      allTime: ((currentValue - day30Value) / day30Value) * 100,
    };

    const trends = {
      valueTrend: performance.day7 > 5 ? 'up' : performance.day7 < -5 ? 'down' : 'stable',
      scoreTrend: 'up' as 'up' | 'down' | 'stable',
      activityTrend: 'up' as 'up' | 'down' | 'stable',
    };

    const result: PortfolioPerformanceData = {
      address: normalizedAddress,
      currentValue,
      performance,
      dataPoints,
      trends,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 10 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching portfolio performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio performance' },
      { status: 500 }
    );
  }
}

