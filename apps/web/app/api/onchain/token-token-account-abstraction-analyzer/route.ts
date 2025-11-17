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

    return NextResponse.json({
      success: true,
      address,
      chainId,
      accountAbstraction: {
        isSmartWallet: code && code !== '0x',
        usagePatterns: [],
        transactionCount: 0,
        abstractionType: code && code !== '0x' ? 'smart_contract' : 'eoa',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze account abstraction' },
      { status: 500 }
    );
  }
}

