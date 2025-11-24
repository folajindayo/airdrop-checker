/**
 * Smart Contract Analyzer
 * Analyze smart contract code and patterns
 * GET /api/onchain/smart-contract-analyzer/[address]
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
    const chainId = parseInt(searchParams.get('chainId') || '1');
    const contractAddress = params.address as Address;

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

    const code = await publicClient.getBytecode({
      address: contractAddress,
    });

    return NextResponse.json({
      success: true,
      contractAddress,
      chainId,
      hasCode: !!code,
      bytecodeSize: code ? code.length : 0,
      analysis: {},
      type: 'contract-analyzer',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze contract' },
      { status: 500 }
    );
  }
}
