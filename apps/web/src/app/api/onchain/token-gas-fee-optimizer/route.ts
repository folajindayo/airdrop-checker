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

    const gasPrice = await publicClient.getGasPrice();

    return NextResponse.json({
      success: true,
      address,
      chainId,
      gasOptimization: {
        currentGasPrice: gasPrice.toString(),
        recommendedGasPrice: (gasPrice * 110n / 100n).toString(),
        optimizationTips: [
          'Batch transactions when possible',
          'Use Layer 2 networks for lower fees',
          'Time transactions during low network activity',
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to optimize gas fees' },
      { status: 500 }
    );
  }
}

