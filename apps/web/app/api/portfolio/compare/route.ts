import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * POST /api/portfolio/compare
 * Compare multiple wallet portfolios
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { addresses } = body;

    if (!addresses || !Array.isArray(addresses) || addresses.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 addresses are required for comparison' },
        { status: 400 }
      );
    }

    // Validate all addresses
    for (const address of addresses) {
      if (!isValidAddress(address)) {
        return NextResponse.json(
          { error: `Invalid address: ${address}` },
          { status: 400 }
        );
      }
    }

    // Mock comparison data (in production, fetch real portfolio data)
    const portfolios = addresses.map((address, index) => ({
      address: address.toLowerCase(),
      totalValue: 10000 + Math.random() * 50000,
      eligibleAirdrops: 5 + Math.floor(Math.random() * 10),
      claimedAirdrops: Math.floor(Math.random() * 5),
      totalGasSpent: 500 + Math.random() * 2000,
      chains: ['ethereum', 'base', 'arbitrum'],
      activityScore: 70 + Math.random() * 30,
    }));

    // Calculate comparison metrics
    const comparison = {
      totalValue: {
        highest: portfolios.reduce((max, p) => p.totalValue > max.totalValue ? p : max, portfolios[0]),
        lowest: portfolios.reduce((min, p) => p.totalValue < min.totalValue ? p : min, portfolios[0]),
        average: portfolios.reduce((sum, p) => sum + p.totalValue, 0) / portfolios.length,
      },
      eligibleAirdrops: {
        highest: portfolios.reduce((max, p) => p.eligibleAirdrops > max.eligibleAirdrops ? p : max, portfolios[0]),
        lowest: portfolios.reduce((min, p) => p.eligibleAirdrops < min.eligibleAirdrops ? p : min, portfolios[0]),
        average: portfolios.reduce((sum, p) => sum + p.eligibleAirdrops, 0) / portfolios.length,
      },
      gasEfficiency: portfolios.map((p) => ({
        address: p.address,
        efficiency: p.eligibleAirdrops / (p.totalGasSpent / 1000),
        rank: 0, // Will be calculated below
      })),
    };

    // Rank by gas efficiency
    comparison.gasEfficiency.sort((a, b) => b.efficiency - a.efficiency);
    comparison.gasEfficiency.forEach((item, index) => {
      item.rank = index + 1;
    });

    return NextResponse.json({
      success: true,
      comparison: {
        portfolios,
        metrics: comparison,
        insights: [
          `Best performing wallet: ${comparison.totalValue.highest.address}`,
          `Most gas efficient: ${comparison.gasEfficiency[0].address}`,
          `Average portfolio value: $${comparison.totalValue.average.toFixed(2)}`,
        ],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Portfolio compare API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to compare portfolios',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

