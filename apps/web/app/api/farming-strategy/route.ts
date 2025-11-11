import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface StrategyStep {
  id: string;
  title: string;
  description: string;
  protocol: string;
  chainId: number;
  chainName: string;
  estimatedGasUSD: number;
  priority: 'high' | 'medium' | 'low';
  impactScore: number;
  affectedAirdrops: string[];
  estimatedTime: string;
}

interface FarmingStrategy {
  address: string;
  currentScore: number;
  targetScore: number;
  estimatedTotalGas: number;
  estimatedTotalValue: number;
  steps: StrategyStep[];
  timeline: {
    week1: StrategyStep[];
    week2: StrategyStep[];
    week3: StrategyStep[];
    week4: StrategyStep[];
  };
  recommendations: string[];
  timestamp: number;
}

// Mock strategy generator - in production, this would use ML/AI
const PROTOCOL_STRATEGIES = [
  {
    protocol: 'Uniswap',
    chains: [1, 8453, 42161],
    gasEstimate: 5,
    impactScore: 15,
    airdrops: ['uniswap', 'arbitrum', 'base'],
  },
  {
    protocol: 'Stargate',
    chains: [1, 8453, 42161, 10],
    gasEstimate: 12,
    impactScore: 20,
    airdrops: ['layerzero', 'stargate'],
  },
  {
    protocol: 'Zora',
    chains: [8453],
    gasEstimate: 3,
    impactScore: 25,
    airdrops: ['zora', 'base'],
  },
  {
    protocol: 'Aave',
    chains: [1, 42161, 10],
    gasEstimate: 8,
    impactScore: 18,
    airdrops: ['aave', 'arbitrum', 'optimism'],
  },
  {
    protocol: 'Curve',
    chains: [1, 42161],
    gasEstimate: 10,
    impactScore: 22,
    airdrops: ['curve', 'arbitrum'],
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, currentScores, targetScore = 80 } = body;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    if (!currentScores || typeof currentScores !== 'object') {
      return NextResponse.json(
        { error: 'Current scores object is required' },
        { status: 400 }
      );
    }

    const currentOverallScore = Object.values(currentScores).reduce(
      (sum: number, score: any) => sum + (typeof score === 'number' ? score : 0),
      0
    ) / Math.max(Object.keys(currentScores).length, 1);

    const steps: StrategyStep[] = [];
    let stepId = 1;

    // Generate strategy steps based on current scores
    PROTOCOL_STRATEGIES.forEach((strategy) => {
      strategy.chains.forEach((chainId) => {
        const chain = { 1: 'Ethereum', 8453: 'Base', 42161: 'Arbitrum', 10: 'Optimism' }[chainId];
        
        // Check if this would improve scores
        const wouldImprove = strategy.airdrops.some((airdrop) => {
          const currentScore = currentScores[airdrop] || 0;
          return currentScore < targetScore;
        });

        if (wouldImprove) {
          steps.push({
            id: `step-${stepId++}`,
            title: `Interact with ${strategy.protocol} on ${chain}`,
            description: `Swap, provide liquidity, or stake on ${strategy.protocol} to improve eligibility scores`,
            protocol: strategy.protocol,
            chainId,
            chainName: chain || 'Unknown',
            estimatedGasUSD: strategy.gasEstimate,
            priority: strategy.impactScore > 20 ? 'high' : strategy.impactScore > 15 ? 'medium' : 'low',
            impactScore: strategy.impactScore,
            affectedAirdrops: strategy.airdrops,
            estimatedTime: '15-30 minutes',
          });
        }
      });
    });

    // Sort by priority and impact
    steps.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.impactScore - a.impactScore;
    });

    // Distribute steps across 4 weeks
    const week1 = steps.slice(0, Math.ceil(steps.length * 0.3));
    const week2 = steps.slice(week1.length, week1.length + Math.ceil(steps.length * 0.3));
    const week3 = steps.slice(week1.length + week2.length, week1.length + week2.length + Math.ceil(steps.length * 0.2));
    const week4 = steps.slice(week1.length + week2.length + week3.length);

    const estimatedTotalGas = steps.reduce((sum, step) => sum + step.estimatedGasUSD, 0);
    const estimatedTotalValue = steps.reduce((sum, step) => sum + step.impactScore * 50, 0); // Rough estimate

    const recommendations: string[] = [];
    
    if (currentOverallScore < 50) {
      recommendations.push('Focus on high-impact protocols first to quickly boost your overall score');
    }
    
    if (estimatedTotalGas > 200) {
      recommendations.push('Consider spreading activities across multiple weeks to manage gas costs');
    }

    const highPrioritySteps = steps.filter((s) => s.priority === 'high');
    if (highPrioritySteps.length > 0) {
      recommendations.push(`Start with ${highPrioritySteps[0].protocol} on ${highPrioritySteps[0].chainName} for maximum impact`);
    }

    const result: FarmingStrategy = {
      address,
      currentScore: currentOverallScore,
      targetScore,
      estimatedTotalGas,
      estimatedTotalValue,
      steps,
      timeline: {
        week1,
        week2,
        week3,
        week4,
      },
      recommendations,
      timestamp: Date.now(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating farming strategy:', error);
    return NextResponse.json(
      { error: 'Failed to generate farming strategy' },
      { status: 500 }
    );
  }
}



