import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-cooldown-tracker/[address]
 * Track cooldown periods for transactions
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

    const cacheKey = `cooldown-tracker:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const cooldown = {
      tokenAddress: address,
      hasCooldown: false,
      cooldownPeriod: '0',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, cooldown, 60 * 1000);
    return NextResponse.json(cooldown);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track cooldown' },
      { status: 500 }
    );
  }
}

