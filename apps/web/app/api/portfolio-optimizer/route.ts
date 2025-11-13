import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface PortfolioOptimization {
  address: string;
  currentAllocation: {
    totalValue: number;
    byChain: Record<string, number>;
    byToken: Array<{
      symbol: string;
      value: number;
      percentage: number;
    }>;
  };
  optimizedAllocation: {
    totalValue: number;
    byChain: Record<string, number>;
    byToken: Array<{
      symbol: string;
      value: number;
      percentage: number;
    }>;
    targetAllocation: Record<string, number>;
  };
  recommendations: Array<{
    action: 'buy' | 'sell' | 'rebalance' | 'bridge';
    token: string;
    chain: string;
    amount: number;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  impact: {
    estimatedScoreIncrease: number;
    estimatedGasCost: number;
    estimatedROI: number;
  };
}

/**
 * POST /api/portfolio-optimizer
 * Optimize portfolio allocation for better airdrop eligibility
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, targetChains, maxGasCost } = body;

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
    const preferredChains = targetChains || [
      'Ethereum',
      'Base',
      'Arbitrum',
      'Optimism',
    ];
    const gasBudget = maxGasCost || 50;

    // Mock current allocation (in production, fetch from portfolio API)
    const currentAllocation = {
      totalValue: 10000,
      byChain: {
        Ethereum: 7000,
        Base: 2000,
        Arbitrum: 1000,
      },
      byToken: [
        { symbol: 'ETH', value: 5000, percentage: 50 },
        { symbol: 'USDC', value: 3000, percentage: 30 },
        { symbol: 'WBTC', value: 2000, percentage: 20 },
      ],
    };

    // Calculate optimal allocation
    const chainCount = preferredChains.length;
    const optimalPerChain = currentAllocation.totalValue / chainCount;

    const optimizedByChain: Record<string, number> = {};
    preferredChains.forEach((chain: string) => {
      optimizedByChain[chain] = Math.round(optimalPerChain);
    });

    // Generate recommendations
    const recommendations: PortfolioOptimization['recommendations'] = [];

    // Check if rebalancing is needed
    Object.entries(currentAllocation.byChain).forEach(([chain, value]) => {
      const target = optimizedByChain[chain] || 0;
      const difference = target - value;

      if (Math.abs(difference) > 500) {
        if (difference > 0) {
          recommendations.push({
            action: 'bridge',
            token: 'ETH',
            chain: chain,
            amount: Math.round(difference),
            reason: `Increase ${chain} allocation for better diversification`,
            priority: 'high',
          });
        } else {
          recommendations.push({
            action: 'bridge',
            token: 'ETH',
            chain: chain,
            amount: Math.round(Math.abs(difference)),
            reason: `Rebalance from ${chain} to other chains`,
            priority: 'medium',
          });
        }
      }
    });

    // Add missing chains
    preferredChains.forEach((chain: string) => {
      if (!currentAllocation.byChain[chain]) {
        recommendations.push({
          action: 'bridge',
          token: 'ETH',
          chain: chain,
          amount: Math.round(optimalPerChain),
          reason: `Add ${chain} to portfolio for multi-chain eligibility`,
          priority: 'high',
        });
      }
    });

    // Token diversification recommendations
    if (currentAllocation.byToken.length < 5) {
      recommendations.push({
        action: 'buy',
        token: 'USDC',
        chain: 'Base',
        amount: 500,
        reason: 'Add stablecoin for DeFi activities',
        priority: 'medium',
      });
    }

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    recommendations.sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
    );

    // Calculate impact
    const estimatedScoreIncrease = Math.min(
      20,
      recommendations.filter((r) => r.priority === 'high').length * 5
    );
    const estimatedGasCost = Math.min(
      gasBudget,
      recommendations.length * 5
    );
    const estimatedROI = estimatedScoreIncrease * 50 - estimatedGasCost;

    const result: PortfolioOptimization = {
      address: normalizedAddress,
      currentAllocation,
      optimizedAllocation: {
        totalValue: currentAllocation.totalValue,
        byChain: optimizedByChain,
        byToken: currentAllocation.byToken, // Would optimize based on airdrop requirements
        targetAllocation: optimizedByChain,
      },
      recommendations: recommendations.slice(0, 10), // Limit to top 10
      impact: {
        estimatedScoreIncrease,
        estimatedGasCost,
        estimatedROI: Math.round(estimatedROI * 100) / 100,
      },
    };

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Portfolio optimizer API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to optimize portfolio',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



