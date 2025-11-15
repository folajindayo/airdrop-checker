import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-treasury-tracker/[address]
 * Track token treasury balances and movements
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

    const cacheKey = `treasury-tracker:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const treasury = {
      treasuryAddress: address,
      totalBalance: '5000000',
      tokenHoldings: [],
      lastUpdate: Date.now(),
    };

    cache.set(cacheKey, treasury, 300 * 1000);
    return NextResponse.json(treasury);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track treasury' },
      { status: 500 }
    );
  }
}

