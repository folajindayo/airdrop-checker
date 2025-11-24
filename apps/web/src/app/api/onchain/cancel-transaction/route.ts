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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, nonce, chainId } = body;

    if (!from || nonce === undefined || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: from, nonce, chainId' },
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

    // Cancel transaction by sending 0 ETH to self with same nonce
    // This replaces the pending transaction
    const transaction = {
      to: from as Address,
      value: BigInt(0),
      nonce: BigInt(nonce),
    };

    return NextResponse.json({
      success: true,
      transaction,
      chainId,
      from,
      nonce: nonce.toString(),
      type: 'cancel_transaction',
      message: `Cancel pending transaction with nonce ${nonce}`,
      note: 'Send this transaction with the same nonce to cancel the pending transaction',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare cancel transaction' },
      { status: 500 }
    );
  }
}

