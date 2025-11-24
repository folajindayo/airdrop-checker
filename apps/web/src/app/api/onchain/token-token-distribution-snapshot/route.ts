import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http, erc20Abi } from 'viem';
import { mainnet } from 'viem/chains';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');
    const blockNumber = searchParams.get('blockNumber');
    const chainId = parseInt(searchParams.get('chainId') || '1');

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    const totalSupply = await publicClient.readContract({
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: 'totalSupply',
      blockNumber: blockNumber ? BigInt(blockNumber) : undefined,
    });

    return NextResponse.json({
      success: true,
      tokenAddress,
      blockNumber: blockNumber || 'latest',
      chainId,
      distributionSnapshot: {
        totalSupply: totalSupply.toString(),
        holders: [],
        timestamp: new Date().toISOString(),
        blockNumber: blockNumber || 'latest',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate distribution snapshot' },
      { status: 500 }
    );
  }
}

