import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { ImpermanentLossRequest, ImpermanentLoss } from '@/lib/onchain/types';

export async function POST(request: NextRequest) {
  try {
    const body: ImpermanentLossRequest = await request.json();
    const { tokenA, tokenB, amountA, amountB, chainId, timeRange } = body;

    if (!tokenA || !tokenB || !amountA || !amountB) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Calculate impermanent loss (simplified - would need historical price data)
    const initialValue = (BigInt(amountA) + BigInt(amountB)).toString();
    const hodlValue = (BigInt(amountA) * BigInt(2)).toString(); // Simplified
    const lpValue = (BigInt(amountA) * BigInt(180) / BigInt(100)).toString(); // 80% of hodl
    const impermanentLoss = (BigInt(hodlValue) - BigInt(lpValue)).toString();
    const impermanentLossPercentage = 20.0; // 20% loss
    const breakEvenPrice = '1000';

    const loss: ImpermanentLoss = {
      tokenA: tokenA as Address,
      tokenB: tokenB as Address,
      initialValue,
      hodlValue,
      lpValue,
      impermanentLoss,
      impermanentLossPercentage,
      breakEvenPrice,
    };

    return NextResponse.json({
      success: true,
      ...loss,
      type: 'impermanent-loss',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate impermanent loss' },
      { status: 500 }
    );
  }
}
