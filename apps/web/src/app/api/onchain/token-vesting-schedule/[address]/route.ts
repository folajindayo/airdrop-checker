import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-vesting-schedule/[address]
 * Get vesting schedule for wallet
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

    const cacheKey = `vesting-schedule:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const vesting = {
      walletAddress: address,
      schedules: [],
      totalVested: '0',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, vesting, 300 * 1000);
    return NextResponse.json(vesting);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get vesting schedule' },
      { status: 500 }
    );
  }
}
