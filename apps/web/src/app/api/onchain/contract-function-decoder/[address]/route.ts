/**
 * Contract Function Decoder
 * Decode contract function calls from transaction data
 * GET /api/onchain/contract-function-decoder/[address]
 */
import { NextRequest, NextResponse } from 'next/server';
import { Address, decodeFunctionData, createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = { 1: mainnet, 8453: base, 42161: arbitrum, 10: optimism, 137: polygon } as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get('data');
    const chainId = parseInt(searchParams.get('chainId') || '1');
    const contractAddress = params.address as Address;

    if (!data) {
      return NextResponse.json(
        { error: 'Missing required parameter: data' },
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

    const decoded = decodeFunctionData({
      abi: [],
      data: data as `0x${string}`,
    });

    return NextResponse.json({
      success: true,
      contractAddress,
      chainId,
      decoded,
      type: 'function-decoder',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to decode function' },
      { status: 500 }
    );
  }
}
