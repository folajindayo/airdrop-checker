import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
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

    return NextResponse.json({
      success: true,
      tokenAddress,
      chainId,
      maxTransactionSize: {
        maxTransactionEnabled: false,
        maxTransactionAmount: '0',
        currentRestriction: 'none',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check max transaction size' },
      { status: 500 }
    );
  }
}

