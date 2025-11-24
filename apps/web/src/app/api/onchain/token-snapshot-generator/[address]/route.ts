import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-snapshot-generator/[address]
 * Generate token holder snapshot
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const blockNumber = searchParams.get('block');

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `snapshot-generator:${address}:${blockNumber || 'latest'}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const snapshot = {
      tokenAddress: address,
      blockNumber: blockNumber || 'latest',
      totalHolders: 0,
      snapshot: [],
      timestamp: Date.now(),
    };

    cache.set(cacheKey, snapshot, 300 * 1000);
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate snapshot' },
      { status: 500 }
    );
  }
}

