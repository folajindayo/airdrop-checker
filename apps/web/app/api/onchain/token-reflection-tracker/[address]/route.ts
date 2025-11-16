import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-reflection-tracker/[address]
 * Track reflection rewards distribution
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

    const cacheKey = `reflection-tracker:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const reflection = {
      walletAddress: address,
      totalReflections: '0',
      reflectionRate: '0',
      hasReflection: false,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, reflection, 60 * 1000);
    return NextResponse.json(reflection);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track reflections' },
      { status: 500 }
    );
  }
}

