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

    const eligibilityScore = Math.min((transactionCount / 20) * 100, 100);

    return NextResponse.json({
      success: true,
      address,
      chainId,
      airdropEligibility: {
        eligible: transactionCount > 10,
        eligibilityScore: Math.round(eligibilityScore),
        criteria: {
          transactionCount,
          activityLevel: transactionCount > 50 ? 'high' : transactionCount > 10 ? 'medium' : 'low',
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check airdrop eligibility' },
      { status: 500 }
    );
  }
}

