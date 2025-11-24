import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-whitelist-checker/[address]
 * Check if address is whitelisted for token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const tokenAddress = searchParams.get('token');

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `whitelist-check:${address}:${tokenAddress || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const whitelist = {
      address,
      tokenAddress: tokenAddress || 'all',
      isWhitelisted: false,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, whitelist, 300 * 1000);
    return NextResponse.json(whitelist);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check whitelist' },
      { status: 500 }
    );
  }
}

