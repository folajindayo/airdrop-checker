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

// Standard unstaking contract ABI
const unstakeAbi = [
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'unstake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unstake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stakingContract, amount, chainId, decimals = 18, unstakeAll = false } = body;

    if (!stakingContract || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: stakingContract, chainId' },
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

    const transaction = unstakeAll
      ? {
          to: stakingContract as Address,
          data: publicClient.encodeFunctionData({
            abi: unstakeAbi,
            functionName: 'unstake',
            args: [],
          }),
        }
      : {
          to: stakingContract as Address,
          data: publicClient.encodeFunctionData({
            abi: unstakeAbi,
            functionName: 'unstake',
            args: [parseUnits(amount.toString(), decimals)],
          }),
        };

    return NextResponse.json({
      success: true,
      transaction,
      chainId,
      stakingContract,
      amount: unstakeAll ? 'all' : amount.toString(),
      unstakeAll,
      type: 'unstake',
      message: unstakeAll 
        ? `Unstake all staked tokens`
        : `Unstake ${amount} tokens`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare unstake transaction' },
      { status: 500 }
    );
  }
}

