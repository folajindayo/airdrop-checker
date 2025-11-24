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

    return NextResponse.json({
      success: true,
      address,
      chainId,
      defiPositions: {
        totalValue: balance.toString(),
        positions: [],
        protocols: [],
        aggregatedValue: balance.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to aggregate DeFi positions' },
      { status: 500 }
    );
  }
}

