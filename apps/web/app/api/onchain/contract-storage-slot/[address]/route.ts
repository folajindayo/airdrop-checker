import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

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

    const cacheKey = `contract-storage-slot:${address.toLowerCase()}:${slot || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const client = createPublicClient({ chain: mainnet, transport: http() });
    
    const storage = {
      address: address.toLowerCase(),
      slot: slot || 'all',
      value: '0x0',
      decodedValue: null,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, storage, 300000);
    return NextResponse.json(storage);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read storage slot' },
      { status: 500 }
    );
  }
}

