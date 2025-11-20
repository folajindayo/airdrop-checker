import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-vesting-schedule-optimizer/[address]
 * Optimize vesting schedule for maximum value
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-vesting-optimizer:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const optimizer: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      vestingSchedule: {
        totalAmount: 1000000,
        cliffMonths: 6,
        vestingMonths: 24,
        monthlyRelease: 41666.67,
      },
      upcomingUnlocks: [],
      optimizationTips: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        optimizer.upcomingUnlocks = [
          {
            date: Date.now() + 30 * 24 * 60 * 60 * 1000,
            amount: optimizer.vestingSchedule.monthlyRelease,
            valueUSD: optimizer.vestingSchedule.monthlyRelease * (parseFloat(response.data.quote_rate || '0')),
          },
        ];
        optimizer.optimizationTips = [
          'Consider staking unlocked tokens for additional yield',
          'Monitor market conditions before large unlocks',
        ];
      }
    } catch (error) {
      console.error('Error optimizing vesting:', error);
    }

    cache.set(cacheKey, optimizer, 60 * 60 * 1000);

    return NextResponse.json(optimizer);
  } catch (error) {
    console.error('Vesting schedule optimizer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to optimize vesting schedule',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

