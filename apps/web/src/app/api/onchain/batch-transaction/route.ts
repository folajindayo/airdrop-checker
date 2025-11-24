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

// Multicall contract ABI (for batch transactions)
const multicallAbi = [
  {
    inputs: [
      {
        components: [
          { name: 'target', type: 'address' },
          { name: 'callData', type: 'bytes' },
        ],
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'aggregate',
    outputs: [
      { name: 'blockNumber', type: 'uint256' },
      { name: 'returnData', type: 'bytes[]' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Multicall3 address (deployed on all major chains)
const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions, chainId } = body;

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0 || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: transactions (array), chainId' },
        { status: 400 }
      );
    }

    if (transactions.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 transactions per batch' },
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

    // Prepare calls array
    const calls = transactions.map((tx: any) => ({
      target: tx.to as Address,
      callData: tx.data || '0x',
    }));

    const transaction = {
      to: MULTICALL3_ADDRESS as Address,
      data: publicClient.encodeFunctionData({
        abi: multicallAbi,
        functionName: 'aggregate',
        args: [calls],
      }),
    };

    return NextResponse.json({
      success: true,
      transaction,
      chainId,
      multicallAddress: MULTICALL3_ADDRESS,
      transactionCount: transactions.length,
      transactions: transactions.map((tx: any, index: number) => ({
        index,
        to: tx.to,
        data: tx.data || '0x',
        value: tx.value || '0',
      })),
      type: 'batch_transaction',
      message: `Batch execute ${transactions.length} transactions`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare batch transaction' },
      { status: 500 }
    );
  }
}

