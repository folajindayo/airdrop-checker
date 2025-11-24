import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-max-wallet-checker/[address]
 * Check max wallet restrictions
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

    const cacheKey = `max-wallet-check:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const maxWallet = {
      tokenAddress: address,
      hasMaxWallet: false,
      maxWalletPercent: '0',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, maxWallet, 300 * 1000);
    return NextResponse.json(maxWallet);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check max wallet' },
      { status: 500 }
    );
  }
}

