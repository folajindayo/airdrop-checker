import { NextRequest, NextResponse } from 'next/server';
import { formatUnits, Address } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

// Standard staking contract ABI
const stakingAbi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'earned',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const stakingContract = searchParams.get('stakingContract');
    const chainId = parseInt(searchParams.get('chainId') || '1');

    if (!address || !stakingContract) {
      return NextResponse.json(
        { error: 'Missing required parameters: address, stakingContract' },
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

    const [stakedBalance, earnedRewards] = await Promise.all([
      publicClient.readContract({
        address: stakingContract as Address,
        abi: stakingAbi,
        functionName: 'balanceOf',
        args: [address as Address],
      }).catch(() => BigInt(0)),
      publicClient.readContract({
        address: stakingContract as Address,
        abi: stakingAbi,
        functionName: 'earned',
        args: [address as Address],
      }).catch(() => BigInt(0)),
    ]);

    return NextResponse.json({
      success: true,
      address,
      stakingContract,
      chainId,
      stakedBalance: stakedBalance.toString(),
      stakedBalanceFormatted: formatUnits(stakedBalance, 18),
      earnedRewards: earnedRewards.toString(),
      earnedRewardsFormatted: formatUnits(earnedRewards, 18),
      type: 'staking_position',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch staking position' },
      { status: 500 }
    );
  }
}

