import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface GasPriceData {
  chainId: number;
  chainName: string;
  current: {
    slow: number;
    standard: number;
    fast: number;
    instant: number;
  };
  historical: {
    average: number;
    min: number;
    max: number;
    trend: 'up' | 'down' | 'stable';
  };
  recommendation: {
    bestTime: string;
    bestSpeed: 'slow' | 'standard' | 'fast';
    estimatedSavings: number;
  };
}

/**
 * GET /api/gas-price-tracker
 * Get real-time gas price data across multiple chains
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get('chainId');
    const hours = parseInt(searchParams.get('hours') || '24');

    // Mock gas price data (in production, fetch from actual gas price APIs)
    const chains = [
      {
        chainId: 1,
        chainName: 'Ethereum',
        current: {
          slow: 15,
          standard: 25,
          fast: 40,
          instant: 60,
        },
        historical: {
          average: 22,
          min: 12,
          max: 55,
          trend: 'down' as const,
        },
      },
      {
        chainId: 8453,
        chainName: 'Base',
        current: {
          slow: 0.1,
          standard: 0.2,
          fast: 0.3,
          instant: 0.5,
        },
        historical: {
          average: 0.18,
          min: 0.05,
          max: 0.4,
          trend: 'stable' as const,
        },
      },
      {
        chainId: 42161,
        chainName: 'Arbitrum One',
        current: {
          slow: 0.1,
          standard: 0.15,
          fast: 0.25,
          instant: 0.4,
        },
        historical: {
          average: 0.14,
          min: 0.05,
          max: 0.35,
          trend: 'stable' as const,
        },
      },
      {
        chainId: 10,
        chainName: 'Optimism',
        current: {
          slow: 0.1,
          standard: 0.15,
          fast: 0.25,
          instant: 0.4,
        },
        historical: {
          average: 0.13,
          min: 0.05,
          max: 0.3,
          trend: 'down' as const,
        },
      },
      {
        chainId: 324,
        chainName: 'zkSync Era',
        current: {
          slow: 0.05,
          standard: 0.1,
          fast: 0.15,
          instant: 0.25,
        },
        historical: {
          average: 0.09,
          min: 0.03,
          max: 0.2,
          trend: 'stable' as const,
        },
      },
      {
        chainId: 137,
        chainName: 'Polygon',
        current: {
          slow: 30,
          standard: 50,
          fast: 80,
          instant: 120,
        },
        historical: {
          average: 45,
          min: 20,
          max: 100,
          trend: 'up' as const,
        },
      },
    ];

    let filteredChains = chains;

    // Filter by chainId if provided
    if (chainId) {
      const id = parseInt(chainId);
      filteredChains = chains.filter((c) => c.chainId === id);
      if (filteredChains.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Chain not found' },
          { status: 404 }
        );
      }
    }

    // Generate recommendations for each chain
    const gasPriceData: GasPriceData[] = filteredChains.map((chain) => {
      const currentHour = new Date().getHours();
      let bestTime = 'now';
      let bestSpeed: 'slow' | 'standard' | 'fast' = 'standard';
      let estimatedSavings = 0;

      // Determine best time (typically lower activity = lower gas)
      if (currentHour >= 0 && currentHour < 8) {
        bestTime = '00:00-08:00 UTC';
        bestSpeed = 'slow';
        estimatedSavings = Math.round(
          (chain.current.standard - chain.current.slow) * 10
        );
      } else if (currentHour >= 8 && currentHour < 16) {
        bestTime = '08:00-16:00 UTC';
        bestSpeed = 'standard';
        estimatedSavings = 0;
      } else {
        bestTime = '16:00-24:00 UTC';
        bestSpeed = 'fast';
        estimatedSavings = 0;
      }

      // Adjust based on trend
      if (chain.historical.trend === 'down') {
        bestTime = 'now';
        bestSpeed = 'standard';
        estimatedSavings = Math.round(
          (chain.historical.average - chain.current.standard) * 10
        );
      }

      return {
        chainId: chain.chainId,
        chainName: chain.chainName,
        current: chain.current,
        historical: chain.historical,
        recommendation: {
          bestTime,
          bestSpeed,
          estimatedSavings: Math.max(0, estimatedSavings),
        },
      };
    });

    // Find cheapest chain
    const cheapestChain = gasPriceData.reduce((cheapest, current) => {
      return current.current.standard < cheapest.current.standard
        ? current
        : cheapest;
    });

    return NextResponse.json({
      success: true,
      chains: gasPriceData,
      cheapestChain: {
        chainId: cheapestChain.chainId,
        chainName: cheapestChain.chainName,
        gasPrice: cheapestChain.current.standard,
      },
      timeframe: `${hours} hours`,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Gas price tracker API error:', error);
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

