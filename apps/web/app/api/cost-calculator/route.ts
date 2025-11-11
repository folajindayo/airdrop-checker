import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cost-calculator
 * Calculate costs for airdrop farming activities
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      activities,
      gasPrice,
      chain = 'ethereum',
    } = body;

    if (!activities || !Array.isArray(activities)) {
      return NextResponse.json(
        { error: 'activities array is required' },
        { status: 400 }
      );
    }

    // Gas costs per activity type (in gwei)
    const gasCosts: Record<string, number> = {
      swap: 150000,
      stake: 100000,
      bridge: 200000,
      mint: 120000,
      claim: 80000,
      transfer: 21000,
      approve: 46000,
      interact: 100000,
    };

    // Average gas prices by chain (in gwei)
    const avgGasPrices: Record<string, number> = {
      ethereum: 30,
      base: 0.1,
      arbitrum: 0.1,
      optimism: 0.1,
      polygon: 30,
      zksync: 0.1,
    };

    const effectiveGasPrice = gasPrice || avgGasPrices[chain] || 30;
    const ethPrice = 2500; // USD (would fetch from API in production)

    let totalGasUsed = 0;
    const breakdown: Array<{
      activity: string;
      gasUsed: number;
      costETH: number;
      costUSD: number;
    }> = [];

    for (const activity of activities) {
      const gasUsed = gasCosts[activity.type] || 100000;
      const costETH = (gasUsed * effectiveGasPrice) / 1e9;
      const costUSD = costETH * ethPrice;

      totalGasUsed += gasUsed;
      breakdown.push({
        activity: activity.type,
        gasUsed,
        costETH: parseFloat(costETH.toFixed(6)),
        costUSD: parseFloat(costUSD.toFixed(2)),
      });
    }

    const totalCostETH = (totalGasUsed * effectiveGasPrice) / 1e9;
    const totalCostUSD = totalCostETH * ethPrice;

    // Calculate potential ROI
    const avgAirdropValue = 1000; // USD (would be dynamic)
    const estimatedROI = activities.length > 0
      ? ((avgAirdropValue - totalCostUSD) / totalCostUSD) * 100
      : 0;

    return NextResponse.json({
      success: true,
      calculation: {
        totalActivities: activities.length,
        totalGasUsed,
        totalCostETH: parseFloat(totalCostETH.toFixed(6)),
        totalCostUSD: parseFloat(totalCostUSD.toFixed(2)),
        gasPrice: effectiveGasPrice,
        chain,
        breakdown,
      },
      roi: {
        estimatedAirdropValue: avgAirdropValue,
        totalCost: parseFloat(totalCostUSD.toFixed(2)),
        estimatedROI: parseFloat(estimatedROI.toFixed(2)),
        breakEvenAirdrops: Math.ceil(totalCostUSD / avgAirdropValue),
      },
      recommendations: [
        totalCostUSD > 500
          ? 'Consider using Layer 2 networks to reduce gas costs'
          : 'Gas costs are reasonable',
        effectiveGasPrice > 50
          ? 'Wait for lower gas prices'
          : 'Current gas prices are acceptable',
      ],
    });
  } catch (error) {
    console.error('Cost calculator API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate costs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



