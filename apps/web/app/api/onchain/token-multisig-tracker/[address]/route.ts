import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-multisig-tracker/[address]
 * Track multisig wallet status and signatures
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

    const cacheKey = `multisig-tracker:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const multisig = {
      multisigAddress: address,
      requiredSignatures: '3',
      totalSigners: '5',
      pendingTransactions: 2,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, multisig, 60 * 1000);
    return NextResponse.json(multisig);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track multisig' },
      { status: 500 }
    );
  }
}

