import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { fetchAllChainTokenBalances, calculateTotalValue } from '@/lib/goldrush/tokens';

export const dynamic = 'force-dynamic';

interface RebalancingRecommendation {
  action: 'buy' | 'sell' | 'hold' | 'move';
  tokenSymbol: string;
  currentAllocation: number; // percentage
  recommendedAllocation: number; // percentage
  currentValue: number;
  recommendedValue: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface RebalancingData {
  address: string;
  currentTotalValue: number;
  currentAllocation: Record<string, number>;
  recommendations: RebalancingRecommendation[];
  targetAllocation: Record<string, number>;
  estimatedGasCost: number;
  timestamp: number;
}

// Target allocation for optimal airdrop eligibility
const TARGET_ALLOCATION: Record<string, number> = {
  'ETH': 30,
  'USDC': 20,
  'USDT': 10,
  'WETH': 15,
  'Other': 25,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    // Fetch current portfolio
    const chainTokens = await fetchAllChainTokenBalances(normalizedAddress);
    const totalValue = calculateTotalValue(chainTokens);

    // Calculate current allocation
    const tokenMap = new Map<string, { value: number; symbol: string }>();
    
    Object.values(chainTokens).forEach((tokens) => {
      tokens.forEach((token) => {
        if (token.quote && token.quote > 0) {
          const symbol = token.contract_ticker_symbol?.toUpperCase() || 'UNKNOWN';
          const current = tokenMap.get(symbol) || { value: 0, symbol };
          tokenMap.set(symbol, {
            value: current.value + token.quote,
            symbol,
          });
        }
      });
    });

    const currentAllocation: Record<string, number> = {};
    Array.from(tokenMap.entries()).forEach(([symbol, data]) => {
      currentAllocation[symbol] = (data.value / totalValue) * 100;
    });

    // Generate recommendations
    const recommendations: RebalancingRecommendation[] = [];
    const targetAllocation: Record<string, number> = { ...TARGET_ALLOCATION };

    // Check each token against target allocation
    Object.entries(currentAllocation).forEach(([symbol, currentPct]) => {
      const targetPct = targetAllocation[symbol] || targetAllocation['Other'] || 0;
      const diff = targetPct - currentPct;
      const currentValue = (currentPct / 100) * totalValue;
      const recommendedValue = (targetPct / 100) * totalValue;

      if (Math.abs(diff) > 5) { // Only recommend if difference is > 5%
        let action: 'buy' | 'sell' | 'hold' | 'move' = 'hold';
        let reason = '';

        if (diff > 0) {
          action = 'buy';
          reason = `Increase ${symbol} allocation to ${targetPct.toFixed(1)}% for better diversification`;
        } else {
          action = 'sell';
          reason = `Reduce ${symbol} allocation from ${currentPct.toFixed(1)}% to ${targetPct.toFixed(1)}%`;
        }

        recommendations.push({
          action,
          tokenSymbol: symbol,
          currentAllocation: currentPct,
          recommendedAllocation: targetPct,
          currentValue,
          recommendedValue,
          reason,
          priority: Math.abs(diff) > 15 ? 'high' : Math.abs(diff) > 10 ? 'medium' : 'low',
        });
      }
    });

    // Sort by priority
    recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const estimatedGasCost = recommendations.length * 5; // Rough estimate

    const result: RebalancingData = {
      address: normalizedAddress,
      currentTotalValue: totalValue,
      currentAllocation,
      recommendations: recommendations.slice(0, 10), // Top 10 recommendations
      targetAllocation,
      estimatedGasCost,
      timestamp: Date.now(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating rebalancing recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate rebalancing recommendations' },
      { status: 500 }
    );
  }
}

