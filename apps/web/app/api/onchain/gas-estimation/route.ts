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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, to, value, data, chainId } = body;

    if (!from || !to || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: from, to, chainId' },
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

    const gasEstimate = await publicClient.estimateGas({
      account: from as Address,
      to: to as Address,
      value: value ? BigInt(value) : BigInt(0),
      data: data as `0x${string}` | undefined,
    });

    const feeData = await publicClient.estimateFeesPerGas();

    const estimatedCost = gasEstimate * (feeData.maxFeePerGas || feeData.gasPrice || BigInt(0));

    return NextResponse.json({
      success: true,
      from,
      to,
      chainId,
      gasEstimate: gasEstimate.toString(),
      gasPrice: feeData.gasPrice?.toString() || '0',
      maxFeePerGas: feeData.maxFeePerGas?.toString() || '0',
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString() || '0',
      estimatedCost: estimatedCost.toString(),
      type: 'gas_estimation',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to estimate gas' },
      { status: 500 }
    );
  }
}

