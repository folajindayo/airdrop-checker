import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface SimulationResult {
  address: string;
  scenario: string;
  currentState: {
    overallScore: number;
    eligibleAirdrops: number;
    totalPotentialValue: number;
  };
  simulatedState: {
    overallScore: number;
    eligibleAirdrops: number;
    totalPotentialValue: number;
    scoreChange: number;
  };
  actions: Array<{
    action: string;
    protocol: string;
    chain: string;
    cost: number;
    scoreImpact: number;
    affectedAirdrops: string[];
  }>;
  impact: {
    newEligibleAirdrops: string[];
    improvedAirdrops: string[];
    totalCost: number;
    estimatedROI: number;
  };
  recommendations: string[];
}

/**
 * POST /api/airdrop-simulator
 * Simulate different farming scenarios to see their impact
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      address,
      currentScore,
      actions,
      scenario = 'optimistic',
    } = body;

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const baseScore = currentScore || 50;

    // Default actions if not provided
    const defaultActions = actions || [
      {
        action: 'Swap tokens on Uniswap',
        protocol: 'Uniswap',
        chain: 'Ethereum',
        cost: 15,
        scoreImpact: 8,
      },
      {
        action: 'Bridge to Base',
        protocol: 'Base Bridge',
        chain: 'Base',
        cost: 5,
        scoreImpact: 5,
      },
      {
        action: 'Mint NFT on Zora',
        protocol: 'Zora',
        chain: 'Base',
        cost: 2,
        scoreImpact: 10,
      },
    ];

    // Apply scenario multiplier
    const scenarioMultipliers: Record<string, number> = {
      optimistic: 1.2,
      realistic: 1.0,
      conservative: 0.8,
    };
    const multiplier = scenarioMultipliers[scenario] || 1.0;

    // Process actions
    let simulatedScore = baseScore;
    let totalCost = 0;
    const affectedAirdrops: Set<string> = new Set();
    const actionResults = defaultActions.map((action) => {
      const adjustedImpact = Math.round(action.scoreImpact * multiplier);
      simulatedScore = Math.min(100, simulatedScore + adjustedImpact);
      totalCost += action.cost;

      // Mock affected airdrops
      const airdropList = ['zora', 'base', 'scroll', 'layerzero'];
      const affected = airdropList.slice(0, Math.floor(Math.random() * 3) + 1);
      affected.forEach((id) => affectedAirdrops.add(id));

      return {
        ...action,
        scoreImpact: adjustedImpact,
        affectedAirdrops: affected,
      };
    });

    // Calculate impact
    const newEligibleAirdrops = Array.from(affectedAirdrops).slice(0, 2);
    const improvedAirdrops = Array.from(affectedAirdrops);

    // Estimate ROI
    const estimatedAirdropValue = simulatedScore * 50;
    const estimatedROI = estimatedAirdropValue - totalCost;

    // Generate recommendations
    const recommendations: string[] = [];
    if (simulatedScore >= 80) {
      recommendations.push(
        'Excellent! This scenario would put you in the top tier for airdrop eligibility.'
      );
    }
    if (totalCost > 100) {
      recommendations.push(
        `High cost scenario ($${totalCost}). Consider optimizing for lower-cost actions.`
      );
    }
    if (estimatedROI < 0) {
      recommendations.push(
        'Negative ROI detected. Review strategy and focus on higher-value airdrops.'
      );
    } else {
      recommendations.push(
        `Positive ROI of $${estimatedROI.toFixed(2)}. Strategy looks promising.`
      );
    }
    if (scenario === 'optimistic') {
      recommendations.push(
        'Note: This is an optimistic scenario. Actual results may vary.'
      );
    }

    const result: SimulationResult = {
      address: normalizedAddress,
      scenario,
      currentState: {
        overallScore: baseScore,
        eligibleAirdrops: Math.floor(baseScore / 10),
        totalPotentialValue: baseScore * 50,
      },
      simulatedState: {
        overallScore: Math.round(simulatedScore),
        eligibleAirdrops: Math.floor(simulatedScore / 10),
        totalPotentialValue: Math.round(estimatedAirdropValue),
        scoreChange: Math.round(simulatedScore - baseScore),
      },
      actions: actionResults,
      impact: {
        newEligibleAirdrops,
        improvedAirdrops,
        totalCost,
        estimatedROI: Math.round(estimatedROI * 100) / 100,
      },
      recommendations,
    };

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Airdrop simulator API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to simulate scenario',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

