import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-governance-proposal/[address]
 * Track governance proposals and voting power for tokens
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

    const cacheKey = `governance-proposal:${address}:${proposalId || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const proposals = {
      tokenAddress: address,
      proposalId: proposalId || 'all',
      activeProposals: 3,
      votingPower: '100000',
      proposals: [
        {
          id: '1',
          title: 'Proposal 1',
          status: 'active',
          votesFor: '60',
          votesAgainst: '40',
        },
      ],
      timestamp: Date.now(),
    };

    cache.set(cacheKey, proposals, 60 * 1000);
    return NextResponse.json(proposals);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch governance proposals' },
      { status: 500 }
    );
  }
}

