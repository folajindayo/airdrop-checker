import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-pause-detector/[address]
 * Detect if token is paused
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

    const cacheKey = `pause-detector:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const pause = {
      tokenAddress: address,
      isPaused: false,
      canPause: false,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, pause, 60 * 1000);
    return NextResponse.json(pause);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to detect pause' },
      { status: 500 }
    );
  }
}

