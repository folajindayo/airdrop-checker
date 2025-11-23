import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { CallDepthRequest, CallDepth } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: CallDepthRequest = await request.json();
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

    // Analyze call depth (simplified - would need trace)
    const callTree: CallDepth['callTree'] = [
      { depth: 0, contract: '0x0000000000000000000000000000000000000000' as `0x${string}`, function: 'main', gasUsed: 100000 },
      { depth: 1, contract: '0x0000000000000000000000000000000000000000' as `0x${string}`, function: 'sub', gasUsed: 50000 },
    ];

    const maxDepth = Math.max(...callTree.map(c => c.depth));
    const deepCalls = callTree.filter(c => c.depth > 3).length;
    const riskLevel = maxDepth > 5 ? 'high' : maxDepth > 3 ? 'medium' : 'low';

    const depth: CallDepth = {
      transactionHash,
      maxDepth,
      callTree,
      deepCalls,
      riskLevel,
    };

    return NextResponse.json({
      success: true,
      ...depth,
      type: 'call-depth',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze call depth' },
      { status: 500 }
    );
  }
}

