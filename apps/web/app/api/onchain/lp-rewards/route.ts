import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { LPRewardRequest, LPReward } from '@/lib/onchain/types';
import { calculateAPY, calculateDailyRewards } from '@/lib/onchain/helpers';

export async function POST(request: NextRequest) {
  try {
    const body: LPRewardRequest = await request.json();
    const { lpTokenAddress, chainId, timeRange = 30 } = body;

    if (!lpTokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: lpTokenAddress' },
        { status: 400 }
      );
    }

    // Calculate LP rewards (simplified - would need actual reward data)
    const totalRewards = BigInt('1000000000000000000000'); // 1000 tokens
    const stakedAmount = BigInt('10000000000000000000000'); // 10000 tokens
    const apy = calculateAPY(totalRewards, stakedAmount, timeRange);
    const dailyRewards = calculateDailyRewards(totalRewards, timeRange);

    const distributionSchedule = Array.from({ length: timeRange }, (_, i) => ({
      timestamp: Date.now() + i * 86400000,
      amount: (totalRewards / BigInt(timeRange)).toString(),
    }));

    const reward: LPReward = {
      lpTokenAddress: lpTokenAddress as Address,
      totalRewards: totalRewards.toString(),
      apy,
      dailyRewards,
      rewardToken: '0x0000000000000000000000000000000000000000' as Address,
      distributionSchedule,
    };

    return NextResponse.json({
      success: true,
      ...reward,
      type: 'lp-rewards',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate LP rewards' },
      { status: 500 }
    );
  }
}

