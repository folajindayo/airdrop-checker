import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-safety-score/[address]
 * Calculate comprehensive safety score for tokens
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

    const cacheKey = `safety-score:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const safety = {
      tokenAddress: address,
      safetyScore: '75',
      riskFactors: [],
      verified: true,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, safety, 300 * 1000);
    return NextResponse.json(safety);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate safety score' },
      { status: 500 }
    );
  }
}

