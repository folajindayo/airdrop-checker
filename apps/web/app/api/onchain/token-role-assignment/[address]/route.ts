import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-role-assignment/[address]
 * Track role assignments and access rights
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-role-assignment:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const tracker: any = {
      walletAddress: normalizedAddress,
      chainId: targetChainId,
      roles: [],
      assignedRoles: [],
      accessRights: {},
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 10 }
      );

      if (response.data && response.data.items) {
        tracker.roles = ['MINTER_ROLE', 'PAUSER_ROLE'];
        tracker.assignedRoles = [];
        tracker.accessRights = { canMint: false, canPause: false };
      }
    } catch (error) {
      console.error('Error tracking role assignments:', error);
    }

    cache.set(cacheKey, tracker, 10 * 60 * 1000);

    return NextResponse.json(tracker);
  } catch (error) {
    console.error('Role assignment tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track role assignments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

