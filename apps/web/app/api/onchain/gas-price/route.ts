import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = parseInt(searchParams.get('chainId') || '1');

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

    const feeData = await publicClient.estimateFeesPerGas();
    const gasPrice = await publicClient.getGasPrice();

    return NextResponse.json({
      success: true,
      chainId,
      chainName: chain.name,
      gasPrice: gasPrice.toString(),
      gasPriceGwei: (Number(gasPrice) / 1e9).toFixed(2),
      maxFeePerGas: feeData.maxFeePerGas?.toString() || gasPrice.toString(),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString() || '0',
      maxFeePerGasGwei: feeData.maxFeePerGas 
        ? (Number(feeData.maxFeePerGas) / 1e9).toFixed(2)
        : (Number(gasPrice) / 1e9).toFixed(2),
      type: 'gas_price',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch gas price' },
      { status: 500 }
    );
  }
}

