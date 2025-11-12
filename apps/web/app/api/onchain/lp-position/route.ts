import { NextRequest, NextResponse } from 'next/server';
import { formatUnits, Address } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

// Uniswap V2 Pair ABI
const pairAbi = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
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
    const address = searchParams.get('address');
    const pairAddress = searchParams.get('pairAddress');
    const chainId = parseInt(searchParams.get('chainId') || '1');

    if (!address || !pairAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: address, pairAddress' },
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

    const [lpBalance, totalSupply, reserves] = await Promise.all([
      publicClient.readContract({
        address: pairAddress as Address,
        abi: pairAbi,
        functionName: 'balanceOf',
        args: [address as Address],
      }),
      publicClient.readContract({
        address: pairAddress as Address,
        abi: pairAbi,
        functionName: 'totalSupply',
      }),
      publicClient.readContract({
        address: pairAddress as Address,
        abi: pairAbi,
        functionName: 'getReserves',
      }),
    ]);

    const lpShare = totalSupply > 0 ? (lpBalance * BigInt(10000)) / totalSupply : BigInt(0);
    const token0Amount = (reserves[0] * lpShare) / BigInt(10000);
    const token1Amount = (reserves[1] * lpShare) / BigInt(10000);

    return NextResponse.json({
      success: true,
      address,
      pairAddress,
      chainId,
      lpBalance: lpBalance.toString(),
      lpBalanceFormatted: formatUnits(lpBalance, 18),
      totalSupply: totalSupply.toString(),
      lpShare: Number(lpShare) / 100,
      reserves: {
        token0: reserves[0].toString(),
        token1: reserves[1].toString(),
      },
      estimatedTokens: {
        token0: token0Amount.toString(),
        token1: token1Amount.toString(),
      },
      type: 'lp_position',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch LP position' },
      { status: 500 }
    );
  }
}

