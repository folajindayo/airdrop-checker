import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { SelfDestructRequest, SelfDestructAnalysis } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: SelfDestructRequest = await request.json();
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
    
    // Check for selfdestruct opcode (0xff)
    const hasSelfDestruct = code?.includes('ff') || false;
    const canSelfDestruct = hasSelfDestruct;
    const destructConditions: string[] = [];
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (canSelfDestruct) riskLevel = 'high';

    const recommendations: string[] = [];
    if (canSelfDestruct) {
      recommendations.push('Contract can self-destruct - funds at risk');
      recommendations.push('Consider using timelock for self-destruct calls');
    }

    const analysis: SelfDestructAnalysis = {
      contractAddress,
      hasSelfDestruct,
      canSelfDestruct,
      destructConditions,
      riskLevel,
      recommendations,
    };

    return NextResponse.json({
      success: true,
      ...analysis,
      type: 'self-destruct-analysis',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze self-destruct' },
      { status: 500 }
    );
  }
}

