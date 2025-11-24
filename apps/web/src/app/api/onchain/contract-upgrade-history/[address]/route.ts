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

    const cacheKey = `contract-upgrade-history:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const client = createPublicClient({ chain: mainnet, transport: http() });
    
    const history = {
      address: address.toLowerCase(),
      upgrades: [],
      totalUpgrades: 0,
      lastUpgrade: null,
      upgradeFrequency: 0,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, history, 300000);
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch upgrade history' },
      { status: 500 }
    );
  }
}

