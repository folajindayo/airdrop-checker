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

    const engagementScore = Math.min((transactionCount / 50) * 100, 100);

    return NextResponse.json({
      success: true,
      address,
      chainId,
      communityEngagement: {
        transactionCount,
        engagementScore: Math.round(engagementScore),
        engagementLevel:
          engagementScore > 70
            ? 'high'
            : engagementScore > 40
              ? 'medium'
              : 'low',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze community engagement' },
      { status: 500 }
    );
  }
}

