import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { BridgeRiskRequest, BridgeRiskAnalysis } from '@/lib/onchain/types';

export async function POST(request: NextRequest) {
  try {
    const body: BridgeRiskRequest = await request.json();
    const { tokenAddress, sourceChainId, destinationChainId, amount } = body;

    if (!tokenAddress || !sourceChainId || !destinationChainId || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Analyze bridge risks
    const bridgeSecurity = 75; // Would analyze bridge contract security
    const liquidityRisk = 30; // Would check destination chain liquidity
    const slippageRisk = 25; // Would calculate expected slippage
    const timeRisk = 15; // Would estimate bridge time

    const totalRisk = (bridgeSecurity + liquidityRisk + slippageRisk + timeRisk) / 4;
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (totalRisk > 60) riskLevel = 'high';
    else if (totalRisk > 40) riskLevel = 'medium';

    const recommendations: string[] = [];
    if (liquidityRisk > 40) recommendations.push('Check destination chain liquidity before bridging');
    if (slippageRisk > 30) recommendations.push('Use lower slippage tolerance for large amounts');
    if (timeRisk > 20) recommendations.push('Consider bridge time for time-sensitive transactions');

    const analysis: BridgeRiskAnalysis = {
      tokenAddress,
      sourceChainId,
      destinationChainId,
      riskLevel,
      risks: {
        bridgeSecurity,
        liquidityRisk,
        slippageRisk,
        timeRisk,
      },
      recommendations,
    };

    return NextResponse.json({
      success: true,
      ...analysis,
      type: 'bridge-risk-analysis',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze bridge risk' },
      { status: 500 }
    );
  }
}


