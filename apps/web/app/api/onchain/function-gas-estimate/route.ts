import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { FunctionGasEstimateRequest, FunctionGasEstimate } from '@/lib/onchain/types';
import { calculateGasBreakdown } from '@/lib/onchain/helpers';

export async function POST(request: NextRequest) {
  try {
    const body: FunctionGasEstimateRequest = await request.json();
    const { contractAddress, functionName, args, chainId } = body;

    if (!contractAddress || !functionName) {
      return NextResponse.json(
        { error: 'Missing required parameters: contractAddress, functionName' },
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

    // Estimate gas (simplified)
    const estimatedGas = 150000;
    const gasBreakdown = calculateGasBreakdown(estimatedGas);

    const optimizationTips: string[] = [];
    if (gasBreakdown.storage > estimatedGas * 0.4) {
      optimizationTips.push('Consider optimizing storage operations');
    }
    if (gasBreakdown.computation > estimatedGas * 0.4) {
      optimizationTips.push('Optimize computation-heavy operations');
    }

    const estimate: FunctionGasEstimate = {
      contractAddress,
      functionName,
      estimatedGas,
      gasBreakdown,
      optimizationTips,
    };

    return NextResponse.json({
      success: true,
      ...estimate,
      type: 'function-gas-estimate',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to estimate function gas' },
      { status: 500 }
    );
  }
}

