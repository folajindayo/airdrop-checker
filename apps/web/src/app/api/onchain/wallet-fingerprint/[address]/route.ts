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

    const cacheKey = `wallet-fingerprint:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const client = createPublicClient({ chain: mainnet, transport: http() });
    
    const fingerprint = {
      address: address.toLowerCase(),
      behavioralPattern: {},
      transactionSignature: {},
      uniqueId: '',
      similarityScore: 0,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, fingerprint, 300000);
    return NextResponse.json(fingerprint);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate wallet fingerprint' },
      { status: 500 }
    );
  }
}
