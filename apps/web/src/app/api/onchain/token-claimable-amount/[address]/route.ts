import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-claimable-amount/[address]
 * Get claimable token amount for wallet
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

    const cacheKey = `claimable-amount:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const claimable = {
      walletAddress: address,
      claimableAmount: '0',
      nextClaimDate: null,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, claimable, 60 * 1000);
    return NextResponse.json(claimable);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get claimable amount' },
      { status: 500 }
    );
  }
}

