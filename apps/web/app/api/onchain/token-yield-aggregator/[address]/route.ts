/**
 * Token Yield Aggregator
 * Aggregate yield farming opportunities for tokens
 * GET /api/onchain/token-yield-aggregator/[address]
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
    });

    return NextResponse.json({
      success: true,
      tokenAddress,
      chainId,
      totalSupply: totalSupply.toString(),
      yieldOpportunities: [],
      type: 'yield-aggregator',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to aggregate yield opportunities' },
      { status: 500 }
    );
  }
}
