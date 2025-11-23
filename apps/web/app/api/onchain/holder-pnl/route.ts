import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { HolderPnLRequest, HolderPnL } from '@/lib/onchain/types';
import { calculatePnL } from '@/lib/onchain/helpers';

export async function POST(request: NextRequest) {
  try {
    const body: HolderPnLRequest = await request.json();
    const { tokenAddress, holderAddress, chainId } = body;

    if (!tokenAddress || !holderAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: tokenAddress, holderAddress' },
        { status: 400 }
      );
    }

    // Calculate PnL (simplified)
    const totalInvested = BigInt('1000000000000000000000'); // 1000 tokens
    const currentValue = BigInt('1200000000000000000000'); // 1200 tokens
    const { profitLoss, percentage } = calculatePnL(totalInvested, currentValue);
    const averageEntryPrice = '1000';
    const currentPrice = '1200';

    const pnl: HolderPnL = {
      tokenAddress,
      holderAddress,
      totalInvested: totalInvested.toString(),
      currentValue: currentValue.toString(),
      profitLoss,
      profitLossPercentage: percentage,
      averageEntryPrice,
      currentPrice,
    };

    return NextResponse.json({
      success: true,
      ...pnl,
      type: 'holder-pnl',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate holder PnL' },
      { status: 500 }
    );
  }
}

