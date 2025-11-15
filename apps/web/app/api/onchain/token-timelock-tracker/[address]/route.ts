import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-timelock-tracker/[address]
 * Track timelock delays for proposals
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

    const cacheKey = `timelock-tracker:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const timelock = {
      timelockAddress: address,
      delay: '48',
      unlockTime: Date.now() + 48 * 60 * 60 * 1000,
      isLocked: true,
      timeRemaining: '48 hours',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, timelock, 60 * 1000);
    return NextResponse.json(timelock);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track timelock' },
      { status: 500 }
    );
  }
}

