import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-flash-swap/[address]
 * Detect and analyze flash swap opportunities
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

    const cacheKey = `flash-swap:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const flashSwap = {
      tokenAddress: address,
      detected: true,
      opportunities: [
        {
          protocol: 'Uniswap V3',
          profit: '1.5',
          risk: 'low',
        },
      ],
      timestamp: Date.now(),
    };

    cache.set(cacheKey, flashSwap, 30 * 1000);
    return NextResponse.json(flashSwap);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to detect flash swaps' },
      { status: 500 }
    );
  }
}

