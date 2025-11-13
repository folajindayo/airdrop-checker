import { NextRequest, NextResponse } from 'next/server';
import { parseUnits, Address, erc20Abi } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenAddress, spender, amount, chainId, decimals = 18, unlimited = false } = body;

    if (!tokenAddress || !spender || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: tokenAddress, spender, chainId' },
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

    // For unlimited approval, use max uint256
    const amountWei = unlimited 
      ? BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
      : parseUnits(amount?.toString() || '0', decimals);

    const transaction = {
      to: tokenAddress as Address,
      data: publicClient.encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender as Address, amountWei],
      }),
    };

    return NextResponse.json({
      success: true,
      transaction,
      chainId,
      tokenAddress,
      spender,
      amount: unlimited ? 'unlimited' : amount?.toString(),
      unlimited,
      type: 'token_approval',
      message: unlimited 
        ? `Approve unlimited tokens for ${spender}`
        : `Approve ${amount} tokens for ${spender}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare token approval' },
      { status: 500 }
    );
  }
}

