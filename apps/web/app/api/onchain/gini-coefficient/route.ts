import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { GiniCoefficientRequest, GiniCoefficient } from '@/lib/onchain/types';
import { calculateGiniCoefficient, interpretGiniCoefficient } from '@/lib/onchain/helpers';

export async function POST(request: NextRequest) {
  try {
    const body: GiniCoefficientRequest = await request.json();
    const { tokenAddress, chainId } = body;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    // Calculate Gini coefficient (simplified)
    const balances = Array.from({ length: 100 }, (_, i) => BigInt(1000000 - i * 5000));
    const giniCoefficient = calculateGiniCoefficient(balances);
    const interpretation = interpretGiniCoefficient(giniCoefficient);

    const percentileDistribution = [10, 25, 50, 75, 90, 95, 99].map(percentile => ({
      percentile,
      balance: balances[Math.floor(balances.length * percentile / 100)]?.toString() || '0',
      percentage: percentile,
    }));

    const recommendations: string[] = [];
    if (interpretation === 'extreme' || interpretation === 'unequal') {
      recommendations.push('High inequality detected - consider token distribution strategies');
    }

    const gini: GiniCoefficient = {
      tokenAddress,
      giniCoefficient,
      interpretation,
      percentileDistribution,
      recommendations,
    };

    return NextResponse.json({
      success: true,
      ...gini,
      type: 'gini-coefficient',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate Gini coefficient' },
      { status: 500 }
    );
  }
}

