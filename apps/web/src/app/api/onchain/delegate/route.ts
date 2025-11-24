import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

// Governance delegation ABI
const delegateAbi = [
  {
    inputs: [{ name: 'delegatee', type: 'address' }],
    name: 'delegate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { governanceToken, delegatee, chainId } = body;

    if (!governanceToken || !delegatee || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: governanceToken, delegatee, chainId' },
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

    const transaction = {
      to: governanceToken as Address,
      data: publicClient.encodeFunctionData({
        abi: delegateAbi,
        functionName: 'delegate',
        args: [delegatee as Address],
      }),
    };

    return NextResponse.json({
      success: true,
      transaction,
      chainId,
      governanceToken,
      delegatee,
      type: 'delegate',
      message: `Delegate voting power to ${delegatee}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare delegate transaction' },
      { status: 500 }
    );
  }
}

