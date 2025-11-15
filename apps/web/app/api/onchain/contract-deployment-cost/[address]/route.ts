/**
 * Contract Deployment Cost Calculator
 * Calculate deployment cost for contracts
 * GET /api/onchain/contract-deployment-cost/[address]
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

    const bytecodeSize = code ? code.length / 2 - 1 : 0;
    const estimatedCost = bytecodeSize * 200;

    return NextResponse.json({
      success: true,
      contractAddress,
      chainId,
      bytecodeSize,
      estimatedGasCost: estimatedCost.toString(),
      type: 'deployment-cost',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate deployment cost' },
      { status: 500 }
    );
  }
}
