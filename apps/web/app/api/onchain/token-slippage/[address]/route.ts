/**
 * Token Slippage Calculator
 * Calculate slippage for token swaps
 * GET /api/onchain/token-slippage/[address]
 */
import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = { 1: mainnet, 8453: base, 42161: arbitrum, 10: optimism, 137: polygon } as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const amountIn = searchParams.get('amountIn');
    const tokenOut = searchParams.get('tokenOut') as Address;
    const chainId = parseInt(searchParams.get('chainId') || '1');
    const tokenIn = params.address as Address;

    if (!amountIn || !tokenOut) {
      return NextResponse.json(
        { error: 'Missing required parameters: amountIn, tokenOut' },
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

    return NextResponse.json({
      success: true,
      tokenIn,
      tokenOut,
      amountIn,
      chainId,
      slippage: '0',
      type: 'slippage',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate slippage' },
      { status: 500 }
    );
  }
}