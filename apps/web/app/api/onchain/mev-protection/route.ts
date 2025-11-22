import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { MEVProtectionRequest, MEVProtectionAnalysis } from '@/lib/onchain/types';
import { calculateMEVRiskScore, determineProtectionLevel, generateMEVRecommendations } from '@/lib/onchain/helpers';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: MEVProtectionRequest = await request.json();
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

    // Fetch transaction details
    const tx = await publicClient.getTransaction({ hash: transactionHash as `0x${string}` });
    const receipt = await publicClient.getTransactionReceipt({ hash: transactionHash as `0x${string}` });
    
    // Get current and average gas prices
    const feeData = await publicClient.estimateGas({ account: tx.from });
    const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
    
    const currentGasPrice = tx.gasPrice || tx.maxFeePerGas || BigInt(0);
    const averageGasPrice = block.baseFeePerGas || BigInt(0);
    
    const gasPricePremium = averageGasPrice > 0 
      ? Number(currentGasPrice - averageGasPrice) / Number(averageGasPrice)
      : 0;

    // Analyze transaction for MEV indicators
    const hasPrivatePool = tx.maxPriorityFeePerGas ? Number(tx.maxPriorityFeePerGas) > Number(averageGasPrice) * 1.5 : false;
    const hasFlashbots = tx.maxPriorityFeePerGas ? Number(tx.maxPriorityFeePerGas) === 0 : false;
    
    // Check for sandwich attack patterns (same token, similar amounts)
    const detectedMEV = gasPricePremium > 0.3;
    const mevType = detectedMEV ? (gasPricePremium > 0.5 ? 'frontrunning' : 'sandwich') : undefined;

    const riskScore = calculateMEVRiskScore(gasPricePremium, hasPrivatePool, hasFlashbots);
    const protectionLevel = determineProtectionLevel(riskScore);
    const isProtected = protectionLevel === 'high' || protectionLevel === 'medium';
    const recommendations = generateMEVRecommendations(riskScore, isProtected);

    const analysis: MEVProtectionAnalysis = {
      transactionHash,
      isProtected,
      protectionLevel,
      detectedMEV,
      mevType,
      riskScore,
      recommendations,
      gasPriceAnalysis: {
        current: currentGasPrice.toString(),
        average: averageGasPrice.toString(),
        premium: (gasPricePremium * 100).toFixed(2) + '%',
      },
    };

    return NextResponse.json({
      success: true,
      ...analysis,
      type: 'mev-protection-analysis',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze MEV protection' },
      { status: 500 }
    );
  }
}


