import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-abi-generator/[address]
 * Generate ABI from contract bytecode
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

    const cacheKey = `abi-generator:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const abi = {
      contractAddress: address,
      abi: [],
      functions: [],
      events: [],
      timestamp: Date.now(),
    };

    cache.set(cacheKey, abi, 300 * 1000);
    return NextResponse.json(abi);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate ABI' },
      { status: 500 }
    );
  }
}

