import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { LPRewardTrackerRequest, LPRewardTracker } from '@/lib/onchain/types';

export async function POST(request: NextRequest) {
  try {
    const body: LPRewardTrackerRequest = await request.json();
    const { lpTokenAddress, chainId, timeRange = 30 } = body;

    if (!lpTokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: lpTokenAddress' },
        { status: 400 }
      );
    }

    // Track LP rewards (simplified)
    const totalRewards = '10000000000000000000000';
    const rewardHistory = Array.from({ length: timeRange }, (_, i) => ({
      timestamp: Date.now() - (timeRange - i) * 86400000,
      amount: (BigInt(totalRewards) / BigInt(timeRange)).toString(),
      apy: 5.0 + (i * 0.1),
    }));

    const currentAPY = rewardHistory[rewardHistory.length - 1]?.apy || 5.0;
    const trend: 'increasing' | 'decreasing' | 'stable' = currentAPY > rewardHistory[0]?.apy ? 'increasing' : 'decreasing';

    const tracker: LPRewardTracker = {
      lpTokenAddress,
      totalRewards,
      rewardHistory,
      currentAPY,
      trend,
    };

    return NextResponse.json({
      success: true,
      ...tracker,
      type: 'lp-reward-tracker',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to track LP rewards' },
      { status: 500 }
    );
  }
}

