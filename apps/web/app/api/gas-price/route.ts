import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gas-price
 * Get current and historical gas prices across chains
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain') || 'all';
    const timeframe = searchParams.get('timeframe') || '24h';

    // Mock gas price data (in production, fetch from real APIs)
    const gasPrices: Record<string, any> = {
      ethereum: {
        current: {
          slow: 15,
          standard: 25,
          fast: 35,
          instant: 50,
        },
        average: 25,
        trend: 'down',
        change24h: -5,
      },
      base: {
        current: {
          slow: 0.05,
          standard: 0.1,
          fast: 0.15,
          instant: 0.2,
        },
        average: 0.1,
        trend: 'stable',
        change24h: 0,
      },
      arbitrum: {
        current: {
          slow: 0.05,
          standard: 0.1,
          fast: 0.15,
          instant: 0.2,
        },
        average: 0.1,
        trend: 'stable',
        change24h: 0,
      },
      optimism: {
        current: {
          slow: 0.05,
          standard: 0.1,
          fast: 0.15,
          instant: 0.2,
        },
        average: 0.1,
        trend: 'stable',
        change24h: 0,
      },
      polygon: {
        current: {
          slow: 30,
          standard: 40,
          fast: 50,
          instant: 60,
        },
        average: 40,
        trend: 'up',
        change24h: 2,
      },
      zksync: {
        current: {
          slow: 0.05,
          standard: 0.1,
          fast: 0.15,
          instant: 0.2,
        },
        average: 0.1,
        trend: 'stable',
        change24h: 0,
      },
    };

    if (chain === 'all') {
      return NextResponse.json({
        success: true,
        gasPrices,
        timeframe,
        timestamp: new Date().toISOString(),
        recommendations: {
          cheapest: 'base',
          fastest: 'ethereum',
          bestValue: 'arbitrum',
        },
      });
    }

    if (!gasPrices[chain]) {
      return NextResponse.json(
        { error: `Unsupported chain: ${chain}` },
        { status: 400 }
      );
    }

    // Historical data (mock)
    const historical = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      price: gasPrices[chain].average + Math.random() * 10 - 5,
    }));

    return NextResponse.json({
      success: true,
      chain,
      current: gasPrices[chain].current,
      average: gasPrices[chain].average,
      trend: gasPrices[chain].trend,
      change24h: gasPrices[chain].change24h,
      historical,
      timeframe,
      timestamp: new Date().toISOString(),
      alerts: gasPrices[chain].average > 50
        ? ['Gas prices are high. Consider waiting or using Layer 2.']
        : [],
    });
  } catch (error) {
    console.error('Gas price API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch gas prices',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



