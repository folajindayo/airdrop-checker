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
    const address = searchParams.get('address');
    const tokenAddress = searchParams.get('tokenAddress');
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

    if (tokenAddress) {
      // ERC20 token balance
      const balance = await publicClient.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address as Address],
      });

      const decimals = await publicClient.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'decimals',
      });

      const symbol = await publicClient.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'symbol',
      }).catch(() => 'TOKEN');

      return NextResponse.json({
        success: true,
        address,
        tokenAddress,
        chainId,
        balance: balance.toString(),
        balanceFormatted: formatUnits(balance, decimals),
        decimals: Number(decimals),
        symbol,
        type: 'erc20',
      });
    } else {
      // Native token balance
      const balance = await publicClient.getBalance({
        address: address as Address,
      });

      return NextResponse.json({
        success: true,
        address,
        chainId,
        balance: balance.toString(),
        balanceFormatted: formatUnits(balance, 18),
        decimals: 18,
        symbol: chain.nativeCurrency.symbol,
        type: 'native',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch token balance' },
      { status: 500 }
    );
  }
}

