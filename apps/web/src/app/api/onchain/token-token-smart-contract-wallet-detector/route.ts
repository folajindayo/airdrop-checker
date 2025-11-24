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
      walletDetection: {
        isSmartContractWallet: code && code !== '0x',
        walletType: code && code !== '0x' ? 'smart_contract' : 'eoa',
        deploymentDate: null,
        contractSize: code ? code.length : 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to detect smart contract wallet' },
      { status: 500 }
    );
  }
}

