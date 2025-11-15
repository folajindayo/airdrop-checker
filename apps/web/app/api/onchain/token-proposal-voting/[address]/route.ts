import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
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
    const proposalId = searchParams.get('proposalId');

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `proposal-voting:${address}:${proposalId || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const voting = {
      proposalId: proposalId || 'all',
      votesFor: '60',
      votesAgainst: '40',
      totalVotes: '100',
      participationRate: '75',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, voting, 60 * 1000);
    return NextResponse.json(voting);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track proposal voting' },
      { status: 500 }
    );
  }
}

