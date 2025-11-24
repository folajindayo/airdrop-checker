import { NextRequest, NextResponse } from 'next/server';
import { parseUnits, formatUnits, Address, erc20Abi } from 'viem';
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
    const { from, to, tokenAddress, amount, chainId, decimals = 18 } = body;

    if (!from || !to || !amount || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: from, to, amount, chainId' },
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

    // If tokenAddress is provided, it's an ERC20 transfer
    if (tokenAddress) {
      const amountWei = parseUnits(amount.toString(), decimals);
      
      const transaction = {
        to: tokenAddress as Address,
        data: publicClient.encodeFunctionData({
          abi: erc20Abi,
          functionName: 'transfer',
          args: [to as Address, amountWei],
        }),
      };

      return NextResponse.json({
        success: true,
        transaction,
        chainId,
        from,
        to,
        tokenAddress,
        amount: amount.toString(),
        type: 'erc20_transfer',
        message: `Transfer ${amount} tokens from ${from} to ${to}`,
      });
    } else {
      // Native token transfer
      const amountWei = parseUnits(amount.toString(), 18);
      
      const transaction = {
        to: to as Address,
        value: amountWei,
      };

      return NextResponse.json({
        success: true,
        transaction,
        chainId,
        from,
        to,
        amount: amount.toString(),
        type: 'native_transfer',
        message: `Transfer ${amount} native tokens from ${from} to ${to}`,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare token transfer' },
      { status: 500 }
    );
  }
}

