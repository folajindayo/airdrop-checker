import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-delegation-tracker/[address]
 * Track token delegation status
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

    const cacheKey = `delegation-tracker:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const delegation = {
      walletAddress: address,
      delegatedTo: null,
      delegatedAmount: '0',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, delegation, 60 * 1000);
    return NextResponse.json(delegation);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track delegation' },
      { status: 500 }
    );
  }
}

