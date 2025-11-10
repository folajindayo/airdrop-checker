import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface OptimizedStrategy {
  address: string;
  currentScore: number;
  targetScore: number;
  budget: number;
  optimizedPlan: {
    totalCost: number;
    estimatedScore: number;
    roi: number;
    steps: Array<{
      action: string;
      protocol: string;
      chain: string;
      cost: number;
      scoreImpact: number;
      priority: 'high' | 'medium' | 'low';
      estimatedTime: string;
    }>;
  };
  alternatives: Array<{
    name: string;
    totalCost: number;
    estimatedScore: number;
    roi: number;
    description: string;
  }>;
  recommendations: string[];
}

/**
 * POST /api/strategy-optimizer
 * Optimize airdrop farming strategy based on budget and goals
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      address,
      currentScore,
      targetScore,
      budget,
      preferredChains,
      maxGasPrice,
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
    const current = currentScore || 50;
    const target = targetScore || 80;
    const availableBudget = budget || 100;
    const gasLimit = maxGasPrice || 50; // USD

    // Calculate score gap
    const scoreGap = target - current;
    if (scoreGap <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Target score must be higher than current score',
        },
        { status: 400 }
      );
    }

    // Generate optimized strategy steps
    const steps = [
      {
        action: 'Swap tokens on Uniswap',
        protocol: 'Uniswap',
        chain: 'Ethereum',
        cost: 15,
        scoreImpact: 8,
        priority: 'high' as const,
        estimatedTime: '5 minutes',
      },
      {
        action: 'Bridge assets to Base',
        protocol: 'Base Bridge',
        chain: 'Base',
        cost: 5,
        scoreImpact: 5,
        priority: 'high' as const,
        estimatedTime: '10 minutes',
      },
      {
        action: 'Mint NFT on Zora',
        protocol: 'Zora',
        chain: 'Base',
        cost: 2,
        scoreImpact: 10,
        priority: 'high' as const,
        estimatedTime: '3 minutes',
      },
      {
        action: 'Provide liquidity on Aave',
        protocol: 'Aave',
        chain: 'Arbitrum',
        cost: 20,
        scoreImpact: 12,
        priority: 'medium' as const,
        estimatedTime: '15 minutes',
      },
      {
        action: 'Stake tokens on Lido',
        protocol: 'Lido',
        chain: 'Ethereum',
        cost: 25,
        scoreImpact: 15,
        priority: 'medium' as const,
        estimatedTime: '10 minutes',
      },
    ];

    // Filter steps by budget
    let totalCost = 0;
    let estimatedScore = current;
    const optimizedSteps: typeof steps = [];

    for (const step of steps) {
      if (totalCost + step.cost <= availableBudget && estimatedScore < target) {
        optimizedSteps.push(step);
        totalCost += step.cost;
        estimatedScore = Math.min(target, estimatedScore + step.cost);
      }
    }

    // Sort by priority and score impact
    optimizedSteps.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.scoreImpact - a.scoreImpact;
    });

    // Calculate ROI
    const estimatedAirdropValue = estimatedScore * 50; // Rough estimate
    const roi = estimatedAirdropValue - totalCost;

    // Generate alternative strategies
    const alternatives = [
      {
        name: 'Low-Cost Strategy',
        totalCost: 25,
        estimatedScore: current + 15,
        roi: (current + 15) * 50 - 25,
        description: 'Focus on low-cost, high-impact actions',
      },
      {
        name: 'Multi-Chain Strategy',
        totalCost: 60,
        estimatedScore: current + 25,
        roi: (current + 25) * 50 - 60,
        description: 'Diversify across multiple chains',
      },
      {
        name: 'High-Value Strategy',
        totalCost: availableBudget,
        estimatedScore: Math.min(target, current + 35),
        roi: Math.min(target, current + 35) * 50 - availableBudget,
        description: 'Maximize score with full budget',
      },
    ];

    // Generate recommendations
    const recommendations: string[] = [];
    if (totalCost < availableBudget * 0.5) {
      recommendations.push(
        `Only using ${Math.round((totalCost / availableBudget) * 100)}% of budget. Consider adding more actions.`
      );
    }
    if (estimatedScore < target) {
      recommendations.push(
        `Need $${(target - estimatedScore) * 2} more to reach target score.`
      );
    }
    if (optimizedSteps.length === 0) {
      recommendations.push(
        'Budget too low. Consider increasing budget or focusing on free actions.'
      );
    } else {
      recommendations.push(
        `Optimized plan will increase score by ${estimatedScore - current} points for $${totalCost}.`
      );
    }

    const result: OptimizedStrategy = {
      address: normalizedAddress,
      currentScore: current,
      targetScore: target,
      budget: availableBudget,
      optimizedPlan: {
        totalCost,
        estimatedScore,
        roi,
        steps: optimizedSteps,
      },
      alternatives,
      recommendations,
    };

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Strategy optimizer API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to optimize strategy',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

