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

    const cacheKey = `token-transfer-velocity:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const client = createPublicClient({ chain: mainnet, transport: http() });
    
    const velocity = {
      address: address.toLowerCase(),
      transfersPerDay: 0,
      transfersPerWeek: 0,
      averageTransferSize: '0',
      velocityScore: 0,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, velocity, 300000);
    return NextResponse.json(velocity);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate transfer velocity' },
      { status: 500 }
    );
  }
}
