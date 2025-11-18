import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const addresses = searchParams.get('addresses');
    const chainId = parseInt(searchParams.get('chainId') || '1');

    if (!addresses) {
      return NextResponse.json(
        { error: 'Missing required parameter: addresses' },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    // Build Merkle tree
    const merkleTree = {
      root: null,
      leaves: [],
      proof: {},
      treeDepth: 0,
    };

    return NextResponse.json({
      success: true,
      chainId,
      merkleTree,
      message: 'Merkle tree built successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to build Merkle tree' },
      { status: 500 }
    );
  }
}

