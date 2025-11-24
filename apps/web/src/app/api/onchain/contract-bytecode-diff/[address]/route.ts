/**
 * Contract Bytecode Diff Analyzer
 * Analyze differences in contract bytecode
 * GET /api/onchain/contract-bytecode-diff/[address]
 */
import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = { 1: mainnet, 8453: base, 42161: arbitrum, 10: optimism, 137: polygon } as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const compareAddress = searchParams.get('compareAddress') as Address;
    const chainId = parseInt(searchParams.get('chainId') || '1');
    const contractAddress = params.address as Address;

    if (!compareAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: compareAddress' },
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

    const code1 = await publicClient.getBytecode({
      address: contractAddress,
    });

    const code2 = await publicClient.getBytecode({
      address: compareAddress,
    });

    const isIdentical = code1 === code2;

    return NextResponse.json({
      success: true,
      contractAddress,
      compareAddress,
      chainId,
      isIdentical,
      bytecodeSize1: code1 ? code1.length : 0,
      bytecodeSize2: code2 ? code2.length : 0,
      type: 'bytecode-diff',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze bytecode diff' },
      { status: 500 }
    );
  }
}
