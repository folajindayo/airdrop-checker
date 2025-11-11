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

// Standard claim rewards ABI
const claimRewardsAbi = [
  {
    inputs: [],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rewardsContract, chainId, tokenId } = body;

    if (!rewardsContract || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: rewardsContract, chainId' },
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

    // Try different claim function signatures
    let transaction;
    try {
      if (tokenId !== undefined) {
        transaction = {
          to: rewardsContract as Address,
          data: publicClient.encodeFunctionData({
            abi: claimRewardsAbi,
            functionName: 'claimRewards',
            args: [BigInt(tokenId)],
          }),
        };
      } else {
        // Try claimRewards() first
        transaction = {
          to: rewardsContract as Address,
          data: publicClient.encodeFunctionData({
            abi: claimRewardsAbi,
            functionName: 'claimRewards',
            args: [],
          }),
        };
      }
    } catch {
      // Fallback to claim()
      transaction = {
        to: rewardsContract as Address,
        data: publicClient.encodeFunctionData({
          abi: claimRewardsAbi,
          functionName: 'claim',
          args: [],
        }),
      };
    }

    return NextResponse.json({
      success: true,
      transaction,
      chainId,
      rewardsContract,
      tokenId: tokenId?.toString() || 'all',
      type: 'claim_rewards',
      message: tokenId 
        ? `Claim rewards for token ID ${tokenId}`
        : `Claim all available rewards`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare claim rewards transaction' },
      { status: 500 }
    );
  }
}

