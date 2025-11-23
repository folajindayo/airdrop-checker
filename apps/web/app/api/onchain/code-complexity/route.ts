import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { CodeComplexityRequest, CodeComplexity } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: CodeComplexityRequest = await request.json();
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
    const codeLength = code?.length || 0;

    // Calculate complexity metrics (simplified)
    const linesOfCode = Math.floor(codeLength / 100);
    const cyclomaticComplexity = 15;
    const functionCount = 10;
    const averageFunctionLength = linesOfCode / functionCount;
    
    const complexityScore = (cyclomaticComplexity * 10) + (functionCount * 2) + (averageFunctionLength * 0.5);
    const riskLevel = complexityScore > 200 ? 'high' : complexityScore > 100 ? 'medium' : 'low';

    const recommendations: string[] = [];
    if (complexityScore > 200) {
      recommendations.push('High complexity detected - consider refactoring');
      recommendations.push('Break down large functions into smaller ones');
    }

    const complexity: CodeComplexity = {
      contractAddress,
      complexityScore,
      metrics: {
        linesOfCode,
        cyclomaticComplexity,
        functionCount,
        averageFunctionLength,
      },
      riskLevel,
      recommendations,
    };

    return NextResponse.json({
      success: true,
      ...complexity,
      type: 'code-complexity',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze code complexity' },
      { status: 500 }
    );
  }
}

