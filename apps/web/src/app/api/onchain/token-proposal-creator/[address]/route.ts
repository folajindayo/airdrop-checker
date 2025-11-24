import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-proposal-creator/[address]
 * Get proposals created by wallet
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

    const cacheKey = `proposal-creator:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const proposals = {
      creatorAddress: address,
      totalProposals: 0,
      activeProposals: 0,
      proposals: [],
      timestamp: Date.now(),
    };

    cache.set(cacheKey, proposals, 60 * 1000);
    return NextResponse.json(proposals);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get proposals' },
      { status: 500 }
    );
  }
}

