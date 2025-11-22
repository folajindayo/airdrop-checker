import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { SlippageProtectionRequest, SlippageProtection } from '@/lib/onchain/types';

export async function POST(request: NextRequest) {
  try {
    const body: SlippageProtectionRequest = await request.json();
    const { tokenIn, tokenOut, amountIn, chainId, maxSlippage = 1.0 } = body;

    if (!tokenIn || !tokenOut || !amountIn) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Calculate optimal slippage protection
    const estimatedSlippage = 0.5; // Would calculate from liquidity depth
    const optimalSlippage = Math.max(estimatedSlippage * 1.5, 0.3);
    const recommendedSlippage = Math.min(optimalSlippage, maxSlippage);

    let protectionLevel: 'low' | 'medium' | 'high' = 'medium';
    if (recommendedSlippage < 0.5) protectionLevel = 'high';
    else if (recommendedSlippage > 2.0) protectionLevel = 'low';

    const recommendations: string[] = [];
    if (recommendedSlippage > maxSlippage) {
      recommendations.push('Consider splitting transaction into smaller amounts');
      recommendations.push('Use limit orders for better price control');
    }
    if (estimatedSlippage > 1.0) {
      recommendations.push('High slippage detected - check liquidity depth');
    }

    const protection: SlippageProtection = {
      optimalSlippage,
      recommendedSlippage,
      estimatedSlippage,
      protectionLevel,
      recommendations,
    };

    return NextResponse.json({
      success: true,
      ...protection,
      type: 'slippage-protection',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to optimize slippage protection' },
      { status: 500 }
    );
  }
}

