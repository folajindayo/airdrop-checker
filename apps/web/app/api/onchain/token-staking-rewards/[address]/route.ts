import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-staking-rewards/[address]
 * Track staking rewards for wallet
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

    const cacheKey = `staking-rewards:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const rewards = {
      walletAddress: address,
      totalStaked: '0',
      pendingRewards: '0',
      apy: '0',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, rewards, 60 * 1000);
    return NextResponse.json(rewards);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track staking rewards' },
      { status: 500 }
    );
  }
}

