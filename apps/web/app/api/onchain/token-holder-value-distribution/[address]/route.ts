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

    const cacheKey = `token-holder-value-distribution:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const client = createPublicClient({ chain: mainnet, transport: http() });
    
    const distribution = {
      address: address.toLowerCase(),
      valueDistribution: {},
      percentileBreakdown: {},
      equalityIndex: 0,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, distribution, 300000);
    return NextResponse.json(distribution);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to analyze value distribution' },
      { status: 500 }
    );
  }
}
