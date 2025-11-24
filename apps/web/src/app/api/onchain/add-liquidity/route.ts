import { NextRequest, NextResponse } from 'next/server';
import { parseUnits, Address } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

// Uniswap V2 add liquidity ABI
const addLiquidityAbi = [
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'amountADesired', type: 'uint256' },
      { name: 'amountBDesired', type: 'uint256' },
      { name: 'amountAMin', type: 'uint256' },
      { name: 'amountBMin', type: 'uint256' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'addLiquidity',
    outputs: [
      { name: 'amountA', type: 'uint256' },
      { name: 'amountB', type: 'uint256' },
      { name: 'liquidity', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      routerAddress,
      tokenA,
      tokenB,
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin,
      chainId,
      recipient,
      decimalsA = 18,
      decimalsB = 18,
    } = body;

    if (!routerAddress || !tokenA || !tokenB || !amountADesired || !amountBDesired || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: routerAddress, tokenA, tokenB, amountADesired, amountBDesired, chainId' },
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

    const amountADesiredWei = parseUnits(amountADesired.toString(), decimalsA);
    const amountBDesiredWei = parseUnits(amountBDesired.toString(), decimalsB);
    const amountAMinWei = amountAMin 
      ? parseUnits(amountAMin.toString(), decimalsA)
      : BigInt(0);
    const amountBMinWei = amountBMin
      ? parseUnits(amountBMin.toString(), decimalsB)
      : BigInt(0);
    
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 minutes

    const transaction = {
      to: routerAddress as Address,
      data: publicClient.encodeFunctionData({
        abi: addLiquidityAbi,
        functionName: 'addLiquidity',
        args: [
          tokenA as Address,
          tokenB as Address,
          amountADesiredWei,
          amountBDesiredWei,
          amountAMinWei,
          amountBMinWei,
          (recipient || '0x') as Address,
          deadline,
        ],
      }),
    };

    return NextResponse.json({
      success: true,
      transaction,
      chainId,
      routerAddress,
      tokenA,
      tokenB,
      amountADesired: amountADesired.toString(),
      amountBDesired: amountBDesired.toString(),
      recipient: recipient || 'sender',
      type: 'add_liquidity',
      message: `Add liquidity: ${amountADesired} ${tokenA} and ${amountBDesired} ${tokenB}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare add liquidity transaction' },
      { status: 500 }
    );
  }
}

