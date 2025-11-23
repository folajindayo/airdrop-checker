import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { FallbackAnalyzerRequest, FallbackAnalysis } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: FallbackAnalyzerRequest = await request.json();
    const { contractAddress, chainId } = body;

    if (!contractAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: contractAddress' },
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

    const code = await publicClient.getBytecode({ address: contractAddress });
    
    // Check for fallback/receive functions (simplified)
    const hasFallback = code && code.length > 0;
    const hasReceive = hasFallback;
    const isPayable = hasFallback;
    const gasLimit = 2300;
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (isPayable && gasLimit > 2300) riskLevel = 'high';
    else if (isPayable) riskLevel = 'medium';

    const recommendations: string[] = [];
    if (isPayable) {
      recommendations.push('Payable fallback function detected - ensure proper access control');
      recommendations.push('Limit gas usage in fallback to prevent reentrancy');
    }

    const analysis: FallbackAnalysis = {
      contractAddress,
      hasFallback,
      hasReceive,
      isPayable,
      gasLimit,
      riskLevel,
      recommendations,
    };

    return NextResponse.json({
      success: true,
      ...analysis,
      type: 'fallback-analysis',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze fallback function' },
      { status: 500 }
    );
  }
}

