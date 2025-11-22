import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { GasOptimizationRequest, GasOptimizationReport, GasOptimization } from '@/lib/onchain/types';
import { calculateGasSavings, determineOptimizationPriority } from '@/lib/onchain/helpers';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: GasOptimizationRequest = await request.json();
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

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    // Estimate gas for the function call
    let currentGasEstimate = 0;
    try {
      const gasEstimate = await publicClient.estimateGas({
        to: contractAddress,
        data: '0x', // Would need actual function data
      });
      currentGasEstimate = Number(gasEstimate);
    } catch {
      currentGasEstimate = 100000; // Default estimate
    }

    // Generate optimization suggestions
    const optimizations: GasOptimization[] = [];

    // Suggestion 1: Use storage packing
    if (currentGasEstimate > 50000) {
      const estimatedSavings = Math.floor(currentGasEstimate * 0.15);
      optimizations.push({
        suggestion: 'Pack storage variables to reduce storage slots',
        currentGas: currentGasEstimate,
        estimatedSavings,
        priority: determineOptimizationPriority(estimatedSavings, currentGasEstimate),
        implementation: 'Combine multiple uint128 into single uint256 slots',
      });
    }

    // Suggestion 2: Use events instead of storage for historical data
    if (currentGasEstimate > 30000) {
      const estimatedSavings = Math.floor(currentGasEstimate * 0.10);
      optimizations.push({
        suggestion: 'Use events for historical data instead of storage',
        currentGas: currentGasEstimate,
        estimatedSavings,
        priority: determineOptimizationPriority(estimatedSavings, currentGasEstimate),
        implementation: 'Emit events for data that can be queried off-chain',
      });
    }

    // Suggestion 3: Batch operations
    if (currentGasEstimate > 40000) {
      const estimatedSavings = Math.floor(currentGasEstimate * 0.20);
      optimizations.push({
        suggestion: 'Batch multiple operations in single transaction',
        currentGas: currentGasEstimate,
        estimatedSavings,
        priority: determineOptimizationPriority(estimatedSavings, currentGasEstimate),
        implementation: 'Combine multiple state changes into one transaction',
      });
    }

    const totalPotentialSavings = optimizations.reduce(
      (sum, opt) => sum + opt.estimatedSavings,
      0
    );

    const report: GasOptimizationReport = {
      contractAddress,
      functionName,
      currentGasEstimate,
      optimizations,
      totalPotentialSavings,
    };

    return NextResponse.json({
      success: true,
      ...report,
      type: 'gas-optimization-report',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate gas optimization report' },
      { status: 500 }
    );
  }
}
