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

// Governance voting ABI (Compound/Aave style)
const voteAbi = [
  {
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'support', type: 'uint8' }, // 0=against, 1=for, 2=abstain
    ],
    name: 'castVote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { governanceContract, proposalId, support, chainId } = body;

    if (!governanceContract || proposalId === undefined || support === undefined || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: governanceContract, proposalId, support, chainId' },
        { status: 400 }
      );
    }

    if (![0, 1, 2].includes(support)) {
      return NextResponse.json(
        { error: 'Support must be 0 (against), 1 (for), or 2 (abstain)' },
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
      to: governanceContract as Address,
      data: publicClient.encodeFunctionData({
        abi: voteAbi,
        functionName: 'castVote',
        args: [BigInt(proposalId), support],
      }),
    };

    const supportLabels = ['Against', 'For', 'Abstain'];

    return NextResponse.json({
      success: true,
      transaction,
      chainId,
      governanceContract,
      proposalId: proposalId.toString(),
      support,
      supportLabel: supportLabels[support],
      type: 'vote',
      message: `Vote ${supportLabels[support]} on proposal ${proposalId}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare vote transaction' },
      { status: 500 }
    );
  }
}

