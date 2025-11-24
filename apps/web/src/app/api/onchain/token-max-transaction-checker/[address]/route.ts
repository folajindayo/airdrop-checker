import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-max-transaction-checker/[address]
 * Check max transaction limits
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

    const cacheKey = `max-transaction-check:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const maxTx = {
      tokenAddress: address,
      hasMaxTransaction: false,
      maxTransactionPercent: '0',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, maxTx, 300 * 1000);
    return NextResponse.json(maxTx);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check max transaction' },
      { status: 500 }
    );
  }
}

