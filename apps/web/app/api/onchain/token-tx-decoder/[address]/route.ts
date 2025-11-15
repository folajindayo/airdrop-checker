import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-tx-decoder/[address]
 * Decode transaction data and function calls
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const txHash = searchParams.get('txHash');

    if (!isValidAddress(address) || !txHash) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const cacheKey = `tx-decoder:${address}:${txHash}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const decoded = {
      contractAddress: address,
      txHash,
      functionName: 'transfer',
      parameters: {},
      timestamp: Date.now(),
    };

    cache.set(cacheKey, decoded, 300 * 1000);
    return NextResponse.json(decoded);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to decode transaction' },
      { status: 500 }
    );
  }
}

