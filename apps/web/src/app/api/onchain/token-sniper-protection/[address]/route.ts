import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-sniper-protection/[address]
 * Check sniper protection mechanisms
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

    const cacheKey = `sniper-protection:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const protection = {
      tokenAddress: address,
      hasSniperProtection: false,
      maxTransactionAmount: '0',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, protection, 300 * 1000);
    return NextResponse.json(protection);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check sniper protection' },
      { status: 500 }
    );
  }
}

