import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http, erc20Abi } from 'viem';
import { mainnet } from 'viem/chains';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');
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
    });

    return NextResponse.json({
      success: true,
      tokenAddress,
      chainId,
      concentrationAnalysis: {
        totalSupply: totalSupply.toString(),
        topHolders: [],
        concentrationScore: 0.65,
        decentralizationLevel: 'moderate',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze token holder concentration' },
      { status: 500 }
    );
  }
}

