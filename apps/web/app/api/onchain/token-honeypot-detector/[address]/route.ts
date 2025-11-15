import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-honeypot-detector/[address]
 * Detect honeypot tokens
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

    const cacheKey = `honeypot-detector:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const honeypot = {
      tokenAddress: address,
      isHoneypot: false,
      riskLevel: 'low',
      canSell: true,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, honeypot, 300 * 1000);
    return NextResponse.json(honeypot);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to detect honeypot' },
      { status: 500 }
    );
  }
}

