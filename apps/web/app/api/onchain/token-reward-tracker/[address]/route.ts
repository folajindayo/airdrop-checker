import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-reward-tracker/[address]
 * Track staking and farming rewards for wallet
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const protocol = searchParams.get('protocol');

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `reward-tracker:${address}:${protocol || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const rewards = {
      walletAddress: address,
      protocol: protocol || 'all',
      totalRewards: '5000',
      pendingRewards: '250',
      claimedRewards: '4750',
      rewards24h: '50',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, rewards, 60 * 1000);
    return NextResponse.json(rewards);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track rewards' },
      { status: 500 }
    );
  }
}

