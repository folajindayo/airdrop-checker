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

    const code = await publicClient.getBytecode({
      address: address as Address,
    });

    const isContract = code && code !== '0x';

    return NextResponse.json({
      success: true,
      address,
      chainId,
      developerActivity: {
        isContractDeployer: isContract,
        contractDeployments: isContract ? 1 : 0,
        activityLevel: isContract ? 'high' : 'low',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to track developer activity' },
      { status: 500 }
    );
  }
}

