import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { LiquidityConcentrationRequest, LiquidityConcentration } from '@/lib/onchain/types';

export async function POST(request: NextRequest) {
  try {
    const body: LiquidityConcentrationRequest = await request.json();
    const { tokenAddress, chainId } = body;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    // Analyze liquidity concentration (simplified)
    const topPools: LiquidityConcentration['topPools'] = [
      { dex: 'Uniswap V3', liquidity: '1000000', percentage: 60 },
      { dex: 'SushiSwap', liquidity: '400000', percentage: 24 },
      { dex: 'Curve', liquidity: '300000', percentage: 18 },
    ];

    const concentrationScore = topPools[0]?.percentage || 0;
    const riskLevel = concentrationScore > 70 ? 'high' : concentrationScore > 50 ? 'medium' : 'low';

    const recommendations: string[] = [];
    if (concentrationScore > 70) {
      recommendations.push('High liquidity concentration - consider diversifying across DEXes');
      recommendations.push('Single DEX failure could significantly impact token');
    }

    const concentration: LiquidityConcentration = {
      tokenAddress,
      concentrationScore,
      topPools,
      riskLevel,
      recommendations,
    };

    return NextResponse.json({
      success: true,
      ...concentration,
      type: 'liquidity-concentration',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze liquidity concentration' },
      { status: 500 }
    );
  }
}

