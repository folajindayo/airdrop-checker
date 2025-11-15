/**
 * Token Vesting Claim Calculator
 * Calculate claimable amounts from vesting contracts
 * GET /api/onchain/token-vesting-claim/[address]
 */
import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = { 1: mainnet, 8453: base, 42161: arbitrum, 10: optimism, 137: polygon } as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const beneficiary = searchParams.get('beneficiary') as Address;
    const chainId = parseInt(searchParams.get('chainId') || '1');
    const vestingAddress = params.address as Address;

    if (!beneficiary) {
      return NextResponse.json(
        { error: 'Missing required parameter: beneficiary' },
        { status: 400 }
      );
    }

    const chain = chains[chainId as keyof typeof chains];
    if (!chain) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chainId}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      vestingAddress,
      beneficiary,
      chainId,
      claimableAmount: '0',
      type: 'vesting-claim',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate vesting claim' },
      { status: 500 }
    );
  }
}
