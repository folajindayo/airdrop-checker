/**
 * Contract Function Selector Finder
 * Find function selectors from contract ABI
 * GET /api/onchain/contract-function-selector/[address]
 */
import { NextRequest, NextResponse } from 'next/server';
import { Address, keccak256, toHex } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = { 1: mainnet, 8453: base, 42161: arbitrum, 10: optimism, 137: polygon } as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const functionSignature = searchParams.get('signature');
    const chainId = parseInt(searchParams.get('chainId') || '1');

    if (!functionSignature) {
      return NextResponse.json(
        { error: 'Missing required parameter: signature' },
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

    const hash = keccak256(toHex(functionSignature));
    const selector = hash.slice(0, 10);

    return NextResponse.json({
      success: true,
      functionSignature,
      selector,
      chainId,
      type: 'function-selector',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to find function selector' },
      { status: 500 }
    );
  }
}
