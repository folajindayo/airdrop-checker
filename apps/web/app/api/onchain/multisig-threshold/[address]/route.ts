/**
 * Multi-Sig Threshold Analyzer
 * Analyze multi-sig wallet threshold requirements
 * GET /api/onchain/multisig-threshold/[address]
 */
import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = { 1: mainnet, 8453: base, 42161: arbitrum, 10: optimism, 137: polygon } as const;

const MULTISIG_ABI = [
  {
    name: 'getThreshold',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getOwners',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
  },
] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = parseInt(searchParams.get('chainId') || '1');
    const multisigAddress = params.address as Address;

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

    try {
      const threshold = await publicClient.readContract({
        address: multisigAddress,
        abi: MULTISIG_ABI,
        functionName: 'getThreshold',
      });

      const owners = await publicClient.readContract({
        address: multisigAddress,
        abi: MULTISIG_ABI,
        functionName: 'getOwners',
      });

      return NextResponse.json({
        success: true,
        multisigAddress,
        chainId,
        threshold: threshold.toString(),
        ownerCount: owners.length,
        owners: owners as string[],
        type: 'multisig-threshold',
      });
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Contract does not appear to be a standard multisig',
        type: 'multisig-threshold',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze multisig' },
      { status: 500 }
    );
  }
}
