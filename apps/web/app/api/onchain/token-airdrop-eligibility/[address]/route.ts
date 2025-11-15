import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-airdrop-eligibility/[address]
 * Check airdrop eligibility for wallet
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

    const cacheKey = `airdrop-eligibility:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const eligibility = {
      walletAddress: address,
      isEligible: false,
      eligibleAmount: '0',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, eligibility, 300 * 1000);
    return NextResponse.json(eligibility);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check airdrop eligibility' },
      { status: 500 }
    );
  }
}

