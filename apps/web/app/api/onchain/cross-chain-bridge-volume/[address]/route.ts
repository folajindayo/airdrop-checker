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
    
    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `cross-chain-bridge-volume:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const client = createPublicClient({ chain: mainnet, transport: http() });
    
    const volume = {
      address: address.toLowerCase(),
      totalVolume: '0',
      dailyVolume: '0',
      bridgeCount: 0,
      bridges: [],
      timestamp: Date.now(),
    };

    cache.set(cacheKey, volume, 300000);
    return NextResponse.json(volume);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate bridge volume' },
      { status: 500 }
    );
  }
}

