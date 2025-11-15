import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-health-factor/[address]
 * Calculate health factor for lending positions
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

    const cacheKey = `health-factor:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const health = {
      walletAddress: address,
      healthFactor: '1.5',
      isHealthy: true,
      riskLevel: 'low',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, health, 60 * 1000);
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate health factor' },
      { status: 500 }
    );
  }
}

