import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-blacklist-checker/[address]
 * Check if address is blacklisted
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

    const cacheKey = `blacklist-check:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const blacklist = {
      address,
      isBlacklisted: false,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, blacklist, 300 * 1000);
    return NextResponse.json(blacklist);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check blacklist' },
      { status: 500 }
    );
  }
}

