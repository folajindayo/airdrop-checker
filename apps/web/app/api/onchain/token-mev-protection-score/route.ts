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

    const transactionCount = await publicClient.getTransactionCount({
      address: address as Address,
    });

    const protectionScore = Math.min(transactionCount * 5, 100);

    return NextResponse.json({
      success: true,
      address,
      chainId,
      mevProtection: {
        protectionScore: Math.round(protectionScore),
        protectionLevel:
          protectionScore > 70
            ? 'high'
            : protectionScore > 40
              ? 'medium'
              : 'low',
        transactionCount,
        recommendations: [
          'Use private transaction pools',
          'Batch transactions when possible',
          'Monitor for sandwich attacks',
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate MEV protection score' },
      { status: 500 }
    );
  }
}

