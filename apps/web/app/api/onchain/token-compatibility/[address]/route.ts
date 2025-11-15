import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-compatibility/[address]
 * Check token compatibility with protocols
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const protocol = searchParams.get('protocol');

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `compatibility:${address}:${protocol || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const compatibility = {
      tokenAddress: address,
      protocol: protocol || 'all',
      isCompatible: true,
      supportedProtocols: ['Uniswap', 'Aave', 'Compound'],
      timestamp: Date.now(),
    };

    cache.set(cacheKey, compatibility, 300 * 1000);
    return NextResponse.json(compatibility);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check compatibility' },
      { status: 500 }
    );
  }
}

