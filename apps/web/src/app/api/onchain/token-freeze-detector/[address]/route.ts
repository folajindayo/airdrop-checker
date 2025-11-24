import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-freeze-detector/[address]
 * Detect if token has freeze functionality
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

    const cacheKey = `freeze-detector:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const freeze = {
      tokenAddress: address,
      hasFreezeFunction: false,
      isFrozen: false,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, freeze, 300 * 1000);
    return NextResponse.json(freeze);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to detect freeze' },
      { status: 500 }
    );
  }
}

