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

// Uniswap V2 Pair ABI for price calculation
const pairAbi = [
  {
    inputs: [],
    name: 'getReserves',
    outputs: [
      { name: 'reserve0', type: 'uint112' },
      { name: 'reserve1', type: 'uint112' },
      { name: 'blockTimestampLast', type: 'uint32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');
    const pairAddress = searchParams.get('pairAddress');
    const chainId = parseInt(searchParams.get('chainId') || '1');

    if (!tokenAddress || !pairAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: tokenAddress, pairAddress' },
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

    const reserves = await publicClient.readContract({
      address: pairAddress as Address,
      abi: pairAbi,
      functionName: 'getReserves',
    });

    // Simplified price calculation (in production, use price oracle)
    // Assuming token0 is the token and token1 is WETH/USDC
    const tokenReserve = Number(reserves[0]);
    const quoteReserve = Number(reserves[1]);
    const price = quoteReserve / tokenReserve;

    return NextResponse.json({
      success: true,
      tokenAddress,
      pairAddress,
      chainId,
      reserves: {
        token0: reserves[0].toString(),
        token1: reserves[1].toString(),
      },
      estimatedPrice: price.toString(),
      priceUSD: (price * 2000).toString(), // Simplified USD conversion
      type: 'token_price',
      note: 'Price is estimated from DEX reserves. For accurate prices, use a price oracle.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch token price' },
      { status: 500 }
    );
  }
}

