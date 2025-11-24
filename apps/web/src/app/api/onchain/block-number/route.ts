import { NextRequest, NextResponse } from 'next/server';
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
    const chainId = parseInt(searchParams.get('chainId') || '1');

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

    const blockNumber = await publicClient.getBlockNumber();
    const block = await publicClient.getBlock({ blockNumber });

    return NextResponse.json({
      success: true,
      chainId,
      chainName: chain.name,
      blockNumber: blockNumber.toString(),
      blockTimestamp: block.timestamp.toString(),
      blockHash: block.hash,
      transactionCount: block.transactions.length,
      type: 'block_number',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch block number' },
      { status: 500 }
    );
  }
}

