import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { FlashLoanAttackRequest, FlashLoanAttackAnalysis } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: FlashLoanAttackRequest = await request.json();
    const { transactionHash, chainId } = body;

    if (!transactionHash) {
      return NextResponse.json(
        { error: 'Missing required parameter: transactionHash' },
        { status: 400 }
      );
    }

    const chain = chains[chainId as keyof typeof chains];
    if (!chain) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chainId}` },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    const tx = await publicClient.getTransaction({ hash: transactionHash as `0x${string}` });
    const receipt = await publicClient.getTransactionReceipt({ hash: transactionHash as `0x${string}` });

    // Analyze for flash loan patterns
    const isFlashLoanAttack = receipt.logs.length > 10; // Simplified heuristic
    const flashLoanAmount = tx.value?.toString() || '0';
    const profit = '0'; // Would need to calculate from trace
    const protocols: string[] = [];
    const attackType: 'arbitrage' | 'liquidation' | 'price-manipulation' | undefined = 
      isFlashLoanAttack ? 'arbitrage' : undefined;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (isFlashLoanAttack) {
      riskLevel = receipt.logs.length > 20 ? 'high' : 'medium';
    }

    const analysis: FlashLoanAttackAnalysis = {
      transactionHash,
      isFlashLoanAttack,
      attackType,
      flashLoanAmount,
      profit,
      protocols,
      riskLevel,
    };

    return NextResponse.json({
      success: true,
      ...analysis,
      type: 'flash-loan-attack-analysis',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze flash loan attack' },
      { status: 500 }
    );
  }
}


