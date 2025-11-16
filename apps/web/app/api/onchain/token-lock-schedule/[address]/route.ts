import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-lock-schedule/[address]
 * Get token lock schedule
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

    const cacheKey = `lock-schedule:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const lock = {
      tokenAddress: address,
      locks: [],
      totalLocked: '0',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, lock, 300 * 1000);
    return NextResponse.json(lock);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get lock schedule' },
      { status: 500 }
    );
  }
}

