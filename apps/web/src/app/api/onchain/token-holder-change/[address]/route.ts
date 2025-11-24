/**
 * Token Holder Change Tracker
 * Track changes in token holder count
 * GET /api/onchain/token-holder-change/[address]
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
    const tokenAddress = params.address as Address;

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
      address: tokenAddress,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { indexed: true, name: 'from', type: 'address' },
          { indexed: true, name: 'to', type: 'address' },
          { indexed: false, name: 'value', type: 'uint256' },
        ],
      },
      fromBlock: fromBlock ? BigInt(fromBlock) : undefined,
      toBlock: toBlock ? BigInt(toBlock) : undefined,
    });

    return NextResponse.json({
      success: true,
      tokenAddress,
      chainId,
      transferCount: logs.length,
      blockRange: { fromBlock: fromBlock || 'latest', toBlock: toBlock || 'latest' },
      type: 'holder-change',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to track holder changes' },
      { status: 500 }
    );
  }
}
