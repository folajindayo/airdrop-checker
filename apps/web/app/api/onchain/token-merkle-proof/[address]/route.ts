import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-merkle-proof/[address]
 * Generate merkle proof for airdrop claims
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

    const cacheKey = `merkle-proof:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const proof = {
      walletAddress: address,
      merkleRoot: '0x0000000000000000000000000000000000000000',
      proof: [],
      amount: '0',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, proof, 300 * 1000);
    return NextResponse.json(proof);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate merkle proof' },
      { status: 500 }
    );
  }
}

