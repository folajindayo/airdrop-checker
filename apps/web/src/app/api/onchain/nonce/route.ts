import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import { createPublicClient, http } from 'viem';
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
    const chainId = parseInt(searchParams.get('chainId') || '1');

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

    const [transactionCount, pendingNonce] = await Promise.all([
      publicClient.getTransactionCount({
        address: address as Address,
      }),
      publicClient.getTransactionCount({
        address: address as Address,
        blockTag: 'pending',
      }),
    ]);

    return NextResponse.json({
      success: true,
      address,
      chainId,
      currentNonce: transactionCount.toString(),
      pendingNonce: pendingNonce.toString(),
      nextNonce: pendingNonce.toString(),
      hasPendingTransactions: pendingNonce > transactionCount,
      type: 'nonce_management',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch nonce' },
      { status: 500 }
    );
  }
}

