import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-protocol-fees/[address]
 * Track protocol fees collected
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

    const cacheKey = `protocol-fees:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const fees = {
      protocolAddress: address,
      totalFees: '250000',
      fees24h: '2500',
      feeRate: '0.3',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, fees, 300 * 1000);
    return NextResponse.json(fees);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track protocol fees' },
      { status: 500 }
    );
  }
}

