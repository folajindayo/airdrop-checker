import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { GasRefundRequest, GasRefund } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: GasRefundRequest = await request.json();
    const { transactionHash, chainId } = body;

    if (!transactionHash) {
      return NextResponse.json(
        { error: 'Missing required parameter: transactionHash' },
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

    const receipt = await publicClient.getTransactionReceipt({ hash: transactionHash as `0x${string}` });
    const tx = await publicClient.getTransaction({ hash: transactionHash as `0x${string}` });

    const originalGas = Number(tx.gas || 0);
    const gasUsed = Number(receipt.gasUsed);
    const refundedGas = originalGas - gasUsed;
    const refundPercentage = originalGas > 0 ? (refundedGas / originalGas) * 100 : 0;
    const netGasCost = gasUsed;

    const refund: GasRefund = {
      transactionHash,
      originalGas,
      refundedGas,
      refundPercentage,
      refundReason: 'Unused gas refunded',
      netGasCost,
    };

    return NextResponse.json({
      success: true,
      ...refund,
      type: 'gas-refund',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze gas refund' },
      { status: 500 }
    );
  }
}

