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

    const balance = await publicClient.getBalance({
      address: address as Address,
    });

    const strategies = [
      { protocol: 'Aave', apy: 3.5, risk: 'low' },
      { protocol: 'Compound', apy: 4.2, risk: 'low' },
      { protocol: 'Curve', apy: 5.8, risk: 'medium' },
    ];

    return NextResponse.json({
      success: true,
      address,
      chainId,
      yieldStrategies: {
        balance: balance.toString(),
        strategies,
        recommendedStrategy: strategies[0],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to optimize yield strategy' },
      { status: 500 }
    );
  }
}

