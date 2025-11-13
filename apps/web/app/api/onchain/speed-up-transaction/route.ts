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
    const { 
      originalTxHash, 
      from, 
      to, 
      value, 
      data, 
      nonce, 
      chainId,
      gasPriceMultiplier = 1.1, // 10% increase by default
    } = body;

    if (!from || !to || !nonce || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: from, to, nonce, chainId' },
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

    // Get current gas price
    const feeData = await publicClient.estimateFeesPerGas();
    const currentGasPrice = feeData.maxFeePerGas || feeData.gasPrice || BigInt(0);
    const newGasPrice = BigInt(Math.floor(Number(currentGasPrice) * gasPriceMultiplier));

    // Speed up by resending with higher gas price and same nonce
    const transaction = {
      to: to as Address,
      value: value ? BigInt(value) : BigInt(0),
      data: data || '0x',
      nonce: BigInt(nonce),
      maxFeePerGas: newGasPrice,
      maxPriorityFeePerGas: newGasPrice,
    };

    return NextResponse.json({
      success: true,
      transaction,
      chainId,
      from,
      to,
      nonce: nonce.toString(),
      originalTxHash,
      gasPriceMultiplier,
      originalGasPrice: currentGasPrice.toString(),
      newGasPrice: newGasPrice.toString(),
      type: 'speed_up_transaction',
      message: `Speed up transaction with nonce ${nonce} (${gasPriceMultiplier}x gas price)`,
      note: 'Send this transaction with the same nonce and higher gas price to speed up',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare speed up transaction' },
      { status: 500 }
    );
  }
}

