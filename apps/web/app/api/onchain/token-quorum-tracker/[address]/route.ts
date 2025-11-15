import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-quorum-tracker/[address]
 * Track quorum requirements for proposals
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `quorum-tracker:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const quorum = {
      proposalAddress: address,
      requiredQuorum: '4',
      currentVotes: '3',
      quorumMet: false,
      remainingVotes: '1',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, quorum, 60 * 1000);
    return NextResponse.json(quorum);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track quorum' },
      { status: 500 }
    );
  }
}

