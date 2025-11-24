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

    const knownDeFiProtocols = [
      'Uniswap',
      'Aave',
      'Compound',
      'Curve',
      'MakerDAO',
      'Lido',
      'PancakeSwap',
    ];

    return NextResponse.json({
      success: true,
      address,
      chainId,
      transactionCount,
      protocolIntegration: {
        totalProtocols: knownDeFiProtocols.length,
        protocols: knownDeFiProtocols,
        integrationScore: Math.min(transactionCount / 10, 1),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze DeFi protocol integration' },
      { status: 500 }
    );
  }
}

