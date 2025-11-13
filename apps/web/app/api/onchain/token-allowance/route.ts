import { NextRequest, NextResponse } from 'next/server';
import { formatUnits, Address, erc20Abi } from 'viem';
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
    const owner = searchParams.get('owner');
    const spender = searchParams.get('spender');
    const chainId = parseInt(searchParams.get('chainId') || '1');

    if (!tokenAddress || !owner || !spender) {
      return NextResponse.json(
        { error: 'Missing required parameters: tokenAddress, owner, spender' },
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

    const [allowance, decimals] = await Promise.all([
      publicClient.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [owner as Address, spender as Address],
      }),
      publicClient.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'decimals',
      }).catch(() => 18),
    ]);

    return NextResponse.json({
      success: true,
      tokenAddress,
      owner,
      spender,
      chainId,
      allowance: allowance.toString(),
      allowanceFormatted: formatUnits(allowance, decimals),
      decimals: Number(decimals),
      isUnlimited: allowance.toString() === '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      type: 'token_allowance',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch token allowance' },
      { status: 500 }
    );
  }
}

