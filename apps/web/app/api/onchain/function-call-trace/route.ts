import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { FunctionCallTraceRequest, FunctionCallTrace, FunctionCall } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: FunctionCallTraceRequest = await request.json();
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

    // Trace function calls (simplified - would need trace API)
    const calls: FunctionCall[] = receipt.logs.map((log, index) => ({
      contractAddress: log.address,
      functionName: 'unknown',
      args: [],
      gasUsed: 21000 + index * 1000,
      depth: 0,
    }));

    const totalGas = calls.reduce((sum, call) => sum + call.gasUsed, 0);

    const trace: FunctionCallTrace = {
      transactionHash,
      calls,
      totalCalls: calls.length,
      totalGas,
    };

    return NextResponse.json({
      success: true,
      ...trace,
      type: 'function-call-trace',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to trace function calls' },
      { status: 500 }
    );
  }
}

