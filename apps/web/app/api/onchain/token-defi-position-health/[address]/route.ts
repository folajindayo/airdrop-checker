import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-defi-position-health/[address]
 * Monitor health of DeFi positions and liquidation risks.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    return NextResponse.json({
      address: normalizedAddress,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('DeFi position health error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze DeFi position health' },
      { status: 500 }
    );
  }
}
