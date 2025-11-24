/**
 * Token Distribution Snapshot Generator
 * Generate snapshot of token holders at specific block
 * GET /api/onchain/token-distribution-snapshot/[address]
 */
import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { erc20Abi } from 'viem';

const chains = { 1: mainnet, 8453: base, 42161: arbitrum, 10: optimism, 137: polygon } as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const blockNumber = searchParams.get('blockNumber');
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

    const totalSupply = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'totalSupply',
      blockNumber: blockNumber ? BigInt(blockNumber) : undefined,
    });

    return NextResponse.json({
      success: true,
      tokenAddress,
      chainId,
      blockNumber: blockNumber || 'latest',
      totalSupply: totalSupply.toString(),
      type: 'distribution-snapshot',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate snapshot' },
      { status: 500 }
    );
  }
}
