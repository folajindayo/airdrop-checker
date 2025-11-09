import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface GasPrice {
  chainId: number;
  chainName: string;
  slow: number;
  standard: number;
  fast: number;
  timestamp: number;
}

// Mock gas price data (in production, fetch from chain RPC or gas tracker APIs)
async function getGasPrices(chainId: number): Promise<GasPrice> {
  // Simulate gas prices (in gwei)
  const basePrices: Record<number, { slow: number; standard: number; fast: number }> = {
    1: { slow: 15, standard: 25, fast: 40 }, // Ethereum
    8453: { slow: 0.1, standard: 0.2, fast: 0.5 }, // Base
    42161: { slow: 0.1, standard: 0.15, fast: 0.3 }, // Arbitrum
    10: { slow: 0.1, standard: 0.2, fast: 0.4 }, // Optimism
    324: { slow: 0.1, standard: 0.2, fast: 0.3 }, // zkSync Era
    137: { slow: 30, standard: 50, fast: 80 }, // Polygon
  };

  const prices = basePrices[chainId] || { slow: 1, standard: 2, fast: 5 };
  
  // Add some randomness to simulate real-time changes
  const variation = 0.8 + Math.random() * 0.4; // ±20% variation
  
  return {
    chainId,
    chainName: SUPPORTED_CHAINS.find((c) => c.id === chainId)?.name || 'Unknown',
    slow: Math.round(prices.slow * variation * 100) / 100,
    standard: Math.round(prices.standard * variation * 100) / 100,
    fast: Math.round(prices.fast * variation * 100) / 100,
    timestamp: Date.now(),
  };
}

/**
 * GET /api/gas-optimizer
 * Get gas price recommendations across all chains
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get('chainId');

    if (chainId) {
      const chainIdNum = parseInt(chainId, 10);
      const chain = SUPPORTED_CHAINS.find((c) => c.id === chainIdNum);
      
      if (!chain) {
        return NextResponse.json(
          { error: 'Unsupported chain ID' },
          { status: 400 }
        );
      }

      const gasPrice = await getGasPrices(chainIdNum);
      
      // Determine best time recommendation
      const hour = new Date().getHours();
      const isLowTraffic = hour >= 2 && hour <= 6; // 2 AM - 6 AM UTC
      
      return NextResponse.json({
        success: true,
        gasPrice,
        recommendation: {
          bestTime: isLowTraffic ? 'now' : 'wait',
          suggestedSpeed: isLowTraffic ? 'slow' : 'standard',
          reason: isLowTraffic 
            ? 'Current time shows lower network activity' 
            : 'Consider waiting for off-peak hours (2-6 AM UTC)',
        },
      });
    }

    // Fetch gas prices for all chains
    const gasPrices = await Promise.all(
      SUPPORTED_CHAINS.map((chain) => getGasPrices(chain.id))
    );

    // Find cheapest chain
    const cheapestChain = gasPrices.reduce((min, current) => 
      current.standard < min.standard ? current : min
    );

    // Calculate savings potential
    const savings = gasPrices.map((gp) => ({
      chainId: gp.chainId,
      chainName: gp.chainName,
      savings: Math.round(((gp.standard - cheapestChain.standard) / gp.standard) * 100),
      cost: gp.standard,
    }));

    return NextResponse.json({
      success: true,
      gasPrices,
      cheapestChain: {
        chainId: cheapestChain.chainId,
        chainName: cheapestChain.chainName,
        price: cheapestChain.standard,
      },
      savings,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Gas optimizer API error:', error);
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

