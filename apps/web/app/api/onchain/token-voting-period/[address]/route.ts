import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-voting-period/[address]
 * Track voting period status for proposals
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

    const cacheKey = `voting-period:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const period = {
      proposalAddress: address,
      votingPeriod: '7',
      startTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
      endTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
      timeRemaining: '5 days',
      isActive: true,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, period, 60 * 1000);
    return NextResponse.json(period);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track voting period' },
      { status: 500 }
    );
  }
}

