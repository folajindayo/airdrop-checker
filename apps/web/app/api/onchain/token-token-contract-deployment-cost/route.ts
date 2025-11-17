import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractAddress = searchParams.get('contractAddress');
    const chainId = parseInt(searchParams.get('chainId') || '1');

    if (!contractAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: contractAddress' },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    const code = await publicClient.getBytecode({
      address: contractAddress as Address,
    });

    const estimatedCost = code ? (code.length / 2) * 200 : 0;

    return NextResponse.json({
      success: true,
      contractAddress,
      chainId,
      deploymentCost: {
        estimatedGas: estimatedCost.toString(),
        estimatedCost: (estimatedCost * 0.00000002).toString(),
        contractSize: code ? code.length : 0,
        deploymentDate: null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate deployment cost' },
      { status: 500 }
    );
  }
}

