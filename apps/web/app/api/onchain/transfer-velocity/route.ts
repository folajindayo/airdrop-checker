import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { TransferVelocityRequest, TransferVelocity } from '@/lib/onchain/types';
import { calculateTransferVelocity } from '@/lib/onchain/helpers';

export async function POST(request: NextRequest) {
  try {
    const body: TransferVelocityRequest = await request.json();
    const { tokenAddress, chainId, timeRange = 30 } = body;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    // Calculate transfer velocity (simplified)
    const transferCount = 1000;
    const averageTransferSize = BigInt('1000000000000000000'); // 1 token
    const velocity = calculateTransferVelocity(transferCount, timeRange, averageTransferSize);
    const transferFrequency = transferCount / timeRange;
    const trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    const marketActivity = velocity > 1000000 ? 'high' : velocity > 100000 ? 'medium' : 'low';

    const transferVel: TransferVelocity = {
      tokenAddress,
      velocity,
      averageTransferSize: averageTransferSize.toString(),
      transferFrequency,
      velocityTrend: trend,
      marketActivity,
    };

    return NextResponse.json({
      success: true,
      ...transferVel,
      type: 'transfer-velocity',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate transfer velocity' },
      { status: 500 }
    );
  }
}

