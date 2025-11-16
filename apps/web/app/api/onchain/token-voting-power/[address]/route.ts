import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-voting-power/[address]
 * Calculate voting power for wallet
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

    const cacheKey = `voting-power:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const voting = {
      walletAddress: address,
      votingPower: '0',
      totalSupply: '0',
      powerPercent: '0',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, voting, 60 * 1000);
    return NextResponse.json(voting);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate voting power' },
      { status: 500 }
    );
  }
}
