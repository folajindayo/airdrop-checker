import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { PriceImpactRequest, PriceImpact } from '@/lib/onchain/types';

export async function POST(request: NextRequest) {
  try {
    const body: PriceImpactRequest = await request.json();
    const { tokenAddress, amount, chainId, dex = 'Uniswap V3' } = body;

    if (!tokenAddress || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters: tokenAddress, amount' },
        { status: 400 }
      );
    }

    // Calculate price impact (simplified - would need actual DEX liquidity data)
    const priceImpact = 0.5; // 0.5%
    const priceImpactPercentage = priceImpact;
    const executionPrice = '1000';
    const averagePrice = '995';
    const slippage = 0.3;

    const impact: PriceImpact = {
      tokenAddress: tokenAddress as Address,
      amount,
      priceImpact,
      priceImpactPercentage,
      executionPrice,
      averagePrice,
      slippage,
    };

    return NextResponse.json({
      success: true,
      ...impact,
      type: 'price-impact',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate price impact' },
      { status: 500 }
    );
  }
}

