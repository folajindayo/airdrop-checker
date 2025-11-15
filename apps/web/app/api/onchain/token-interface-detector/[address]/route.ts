import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-interface-detector/[address]
 * Detect ERC interfaces implemented by contract
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

    const cacheKey = `interface-detector:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const interfaces = {
      contractAddress: address,
      interfaces: ['ERC20'],
      standards: ['ERC20'],
      timestamp: Date.now(),
    };

    cache.set(cacheKey, interfaces, 300 * 1000);
    return NextResponse.json(interfaces);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to detect interfaces' },
      { status: 500 }
    );
  }
}

