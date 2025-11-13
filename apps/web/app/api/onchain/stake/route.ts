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

// Standard staking contract ABI
const stakeAbi = [
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'stake',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stakingContract, amount, chainId, decimals = 18, tokenAddress } = body;

    if (!stakingContract || !amount || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: stakingContract, amount, chainId' },
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

    const amountWei = parseUnits(amount.toString(), decimals);

    // If tokenAddress is provided, it's ERC20 staking (requires approval first)
    // Otherwise, it's native token staking
    const transaction = tokenAddress
      ? {
          to: stakingContract as Address,
          data: publicClient.encodeFunctionData({
            abi: stakeAbi,
            functionName: 'stake',
            args: [amountWei],
          }),
        }
      : {
          to: stakingContract as Address,
          value: amountWei,
          data: publicClient.encodeFunctionData({
            abi: stakeAbi,
            functionName: 'stake',
            args: [],
          }),
        };

    return NextResponse.json({
      success: true,
      transaction,
      chainId,
      stakingContract,
      amount: amount.toString(),
      tokenAddress: tokenAddress || 'native',
      type: 'stake',
      message: `Stake ${amount} ${tokenAddress ? 'tokens' : 'native tokens'}`,
      requiresApproval: !!tokenAddress,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare stake transaction' },
      { status: 500 }
    );
  }
}

