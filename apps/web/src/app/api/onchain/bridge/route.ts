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

// Standard bridge contract ABI
const bridgeAbi = [
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'destinationChainId', type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
    name: 'bridge',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bridgeContract, tokenAddress, amount, fromChainId, toChainId, recipient, decimals = 18 } = body;

    if (!bridgeContract || !amount || !fromChainId || !toChainId || !recipient) {
      return NextResponse.json(
        { error: 'Missing required fields: bridgeContract, amount, fromChainId, toChainId, recipient' },
        { status: 400 }
      );
    }

    const chain = chains[fromChainId as keyof typeof chains];
    if (!chain) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${fromChainId}` },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    const amountWei = parseUnits(amount.toString(), decimals);
    const value = tokenAddress ? BigInt(0) : amountWei; // Native token bridge uses value

    const transaction = {
      to: bridgeContract as Address,
      value,
      data: publicClient.encodeFunctionData({
        abi: bridgeAbi,
        functionName: 'bridge',
        args: [
          tokenAddress || '0x0000000000000000000000000000000000000000',
          amountWei,
          BigInt(toChainId),
          recipient as Address,
        ],
      }),
    };

    return NextResponse.json({
      success: true,
      transaction,
      fromChainId,
      toChainId,
      bridgeContract,
      tokenAddress: tokenAddress || 'native',
      amount: amount.toString(),
      recipient,
      type: 'bridge',
      message: `Bridge ${amount} ${tokenAddress ? 'tokens' : 'native tokens'} from chain ${fromChainId} to chain ${toChainId}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare bridge transaction' },
      { status: 500 }
    );
  }
}

