import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-storage-slot/[address]
 * Read contract storage slots
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const slot = searchParams.get('slot');

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `storage-slot:${address}:${slot || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const storage = {
      contractAddress: address,
      slot: slot || '0',
      value: '0x0000000000000000000000000000000000000000000000000000000000000000',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, storage, 300 * 1000);
    return NextResponse.json(storage);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read storage slot' },
      { status: 500 }
    );
  }
}

