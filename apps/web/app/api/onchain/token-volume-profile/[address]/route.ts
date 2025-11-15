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

    const cacheKey = `token-volume-profile:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const client = createPublicClient({ chain: mainnet, transport: http() });
    
    const profile = {
      address: address.toLowerCase(),
      volumeByTimeframe: {},
      peakVolume: '0',
      averageVolume: '0',
      volumeTrend: 'stable',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, profile, 300000);
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate volume profile' },
      { status: 500 }
    );
  }
}
