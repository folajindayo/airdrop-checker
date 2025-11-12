import { NextRequest, NextResponse } from 'next/server';
import { Address, erc20Abi } from 'viem';
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
    const tokenAddress = searchParams.get('tokenAddress');
    const chainId = parseInt(searchParams.get('chainId') || '1');

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
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

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      publicClient.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'name',
      }).catch(() => 'Unknown'),
      publicClient.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'symbol',
      }).catch(() => 'UNKNOWN'),
      publicClient.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'decimals',
      }).catch(() => 18),
      publicClient.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'totalSupply',
      }).catch(() => BigInt(0)),
    ]);

    return NextResponse.json({
      success: true,
      tokenAddress,
      chainId,
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: totalSupply.toString(),
      type: 'token_metadata',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch token metadata' },
      { status: 500 }
    );
  }
}

