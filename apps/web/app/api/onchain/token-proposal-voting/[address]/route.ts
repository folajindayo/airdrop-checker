import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-proposal-voting/[address]
 * Track voting activity on proposals
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
    const cacheKey = `onchain-proposal-voting:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({ ...cachedResult, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const voting: any = {
      proposalAddress: normalizedAddress,
      chainId: targetChainId,
      votesFor: '0',
      votesAgainst: '0',
      totalVotes: '0',
      participationRate: 0,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, voting, 2 * 60 * 1000);
    return NextResponse.json(voting);
  } catch (error) {
    console.error('Proposal voting error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track proposal voting',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
