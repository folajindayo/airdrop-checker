import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chainId = parseInt(searchParams.get('chainId') || '42161');

    if (!address) {
      return NextResponse.json(
        { error: 'Missing required parameter: address' },
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

    const transactionCount = await publicClient.getTransactionCount({
      address: address as Address,
    });

    return NextResponse.json({
      success: true,
      address,
      chainId,
      chainName: chain.name,
      transactionCount,
      isLayer2: chainId !== 1,
      activityLevel: transactionCount > 100 ? 'high' : transactionCount > 10 ? 'medium' : 'low',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze Layer 2 activity' },
      { status: 500 }
    );
  }
}

