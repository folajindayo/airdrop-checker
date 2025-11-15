import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-farming-rewards/[address]
 * Track farming rewards for wallet
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

    const cacheKey = `farming-rewards:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const rewards = {
      walletAddress: address,
      activeFarms: [],
      totalRewards: '0',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, rewards, 60 * 1000);
    return NextResponse.json(rewards);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track farming rewards' },
      { status: 500 }
    );
  }
}

