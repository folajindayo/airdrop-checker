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

// Uniswap V2/V3 swap ABI
const swapAbi = [
  {
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'swapExactTokensForTokens',
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'swapExactETHForTokens',
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      routerAddress, 
      tokenIn, 
      tokenOut, 
      amountIn, 
      amountOutMin, 
      chainId, 
      recipient,
      decimalsIn = 18,
      decimalsOut = 18,
    } = body;

    if (!routerAddress || !tokenIn || !tokenOut || !amountIn || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: routerAddress, tokenIn, tokenOut, amountIn, chainId' },
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

    const amountInWei = parseUnits(amountIn.toString(), decimalsIn);
    const amountOutMinWei = amountOutMin 
      ? parseUnits(amountOutMin.toString(), decimalsOut)
      : BigInt(0);
    
    const path = [tokenIn as Address, tokenOut as Address];
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 minutes

    const isNativeIn = tokenIn.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' || 
                       tokenIn.toLowerCase() === '0x0000000000000000000000000000000000000000';

    const transaction = isNativeIn
      ? {
          to: routerAddress as Address,
          value: amountInWei,
          data: publicClient.encodeFunctionData({
            abi: swapAbi,
            functionName: 'swapExactETHForTokens',
            args: [amountOutMinWei, path, (recipient || '0x') as Address, deadline],
          }),
        }
      : {
          to: routerAddress as Address,
          data: publicClient.encodeFunctionData({
            abi: swapAbi,
            functionName: 'swapExactTokensForTokens',
            args: [amountInWei, amountOutMinWei, path, (recipient || '0x') as Address, deadline],
          }),
        };

    return NextResponse.json({
      success: true,
      transaction,
      chainId,
      routerAddress,
      tokenIn,
      tokenOut,
      amountIn: amountIn.toString(),
      amountOutMin: amountOutMin?.toString() || '0',
      recipient: recipient || 'sender',
      type: 'swap',
      message: `Swap ${amountIn} ${isNativeIn ? 'native tokens' : 'tokens'} for ${tokenOut}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare swap transaction' },
      { status: 500 }
    );
  }
}

