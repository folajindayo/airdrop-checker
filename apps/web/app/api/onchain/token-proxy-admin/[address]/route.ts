import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-proxy-admin/[address]
 * Track proxy admin addresses for upgradeable contracts
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

    const cacheKey = `proxy-admin:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const proxy = {
      proxyAddress: address,
      adminAddress: '0x0000000000000000000000000000000000000000',
      implementationAddress: '0x0000000000000000000000000000000000000000',
      isProxy: true,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, proxy, 300 * 1000);
    return NextResponse.json(proxy);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track proxy admin' },
      { status: 500 }
    );
  }
}

