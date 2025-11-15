/**
 * Token Metadata Updater Checker
 * Check if token metadata can be updated
 * GET /api/onchain/token-metadata-updater-check/[address]
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

    const name = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'name',
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      tokenAddress,
      chainId,
      name: name || 'Unknown',
      updatable: false,
      type: 'metadata-updater-check',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check metadata updater' },
      { status: 500 }
    );
  }
}
