/**
 * Contract Event Indexer
 * Index and retrieve contract events
 * GET /api/onchain/contract-event-indexer/[address]
 */
import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = { 1: mainnet, 8453: base, 42161: arbitrum, 10: optimism, 137: polygon } as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const fromBlock = searchParams.get('fromBlock');
    const toBlock = searchParams.get('toBlock');
    const chainId = parseInt(searchParams.get('chainId') || '1');
    const contractAddress = params.address as Address;

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

    const logs = await publicClient.getLogs({
      address: contractAddress,
      fromBlock: fromBlock ? BigInt(fromBlock) : undefined,
      toBlock: toBlock ? BigInt(toBlock) : undefined,
    });

    return NextResponse.json({
      success: true,
      contractAddress,
      chainId,
      eventCount: logs.length,
      events: logs.slice(0, 100),
      type: 'event-indexer',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to index events' },
      { status: 500 }
    );
  }
}
