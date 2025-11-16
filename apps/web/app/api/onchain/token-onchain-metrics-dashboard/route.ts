import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chainId = parseInt(searchParams.get('chainId') || '1');

    if (!address) {
      return NextResponse.json(
        { error: 'Missing required parameter: address' },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    const [balance, transactionCount, gasPrice] = await Promise.all([
      publicClient.getBalance({ address: address as Address }),
      publicClient.getTransactionCount({ address: address as Address }),
      publicClient.getGasPrice(),
    ]);

    return NextResponse.json({
      success: true,
      address,
      chainId,
      metrics: {
        balance: balance.toString(),
        transactionCount,
        gasPrice: gasPrice.toString(),
        activityScore: Math.min(transactionCount / 10, 100),
        networkHealth: 'good',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get on-chain metrics' },
      { status: 500 }
    );
  }
}

