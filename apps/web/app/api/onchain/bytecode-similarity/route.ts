import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { BytecodeSimilarityRequest, BytecodeSimilarity } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

function calculateSimilarity(codeA: string, codeB: string): number {
  if (!codeA || !codeB) return 0;
  const longer = codeA.length > codeB.length ? codeA : codeB;
  const shorter = codeA.length > codeB.length ? codeB : codeA;
  
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (shorter[i] === longer[i]) matches++;
  }
  
  return (matches / longer.length) * 100;
}

export async function POST(request: NextRequest) {
  try {
    const body: BytecodeSimilarityRequest = await request.json();
    const { contractA, contractB, chainId } = body;

    if (!contractA || !contractB) {
      return NextResponse.json(
        { error: 'Missing required parameters: contractA, contractB' },
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

    const codeA = await publicClient.getBytecode({ address: contractA });
    const codeB = await publicClient.getBytecode({ address: contractB });

    const similarityScore = calculateSimilarity(codeA || '', codeB || '');
    const isFork = similarityScore > 80;

    const similarity: BytecodeSimilarity = {
      contractA,
      contractB,
      similarityScore,
      matchingFunctions: [],
      differences: [],
      isFork,
    };

    return NextResponse.json({
      success: true,
      ...similarity,
      type: 'bytecode-similarity',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze bytecode similarity' },
      { status: 500 }
    );
  }
}

