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

// WETH wrap/unwrap ABI
const wethAbi = [
  {
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'wad', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wethAddress, action, amount, chainId } = body;

    if (!wethAddress || !action || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: wethAddress, action (wrap/unwrap), chainId' },
        { status: 400 }
      );
    }

    if (!['wrap', 'unwrap'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "wrap" or "unwrap"' },
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

    let transaction;
    if (action === 'wrap') {
      if (!amount) {
        return NextResponse.json(
          { error: 'Amount is required for wrap action' },
          { status: 400 }
        );
      }
      const amountWei = parseUnits(amount.toString(), 18);
      transaction = {
        to: wethAddress as Address,
        value: amountWei,
        data: publicClient.encodeFunctionData({
          abi: wethAbi,
          functionName: 'deposit',
          args: [],
        }),
      };
    } else {
      if (!amount) {
        return NextResponse.json(
          { error: 'Amount is required for unwrap action' },
          { status: 400 }
        );
      }
      const amountWei = parseUnits(amount.toString(), 18);
      transaction = {
        to: wethAddress as Address,
        data: publicClient.encodeFunctionData({
          abi: wethAbi,
          functionName: 'withdraw',
          args: [amountWei],
        }),
      };
    }

    return NextResponse.json({
      success: true,
      transaction,
      chainId,
      wethAddress,
      action,
      amount: amount?.toString() || '0',
      type: action === 'wrap' ? 'wrap' : 'unwrap',
      message: action === 'wrap' 
        ? `Wrap ${amount} ETH to WETH`
        : `Unwrap ${amount} WETH to ETH`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare wrap/unwrap transaction' },
      { status: 500 }
    );
  }
}

