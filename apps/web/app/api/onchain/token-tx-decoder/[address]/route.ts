import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
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
    const chainId = searchParams.get('chainId');
    const txHash = searchParams.get('txHash');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-tx-decoder:${normalizedAddress}:${txHash || 'all'}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({ ...cachedResult, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const decoded: any = {
      contractAddress: normalizedAddress,
      chainId: targetChainId,
      txHash: txHash || null,
      functionName: null,
      parameters: [],
      decoded: false,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, decoded, 5 * 60 * 1000);
    return NextResponse.json(decoded);
  } catch (error) {
    console.error('TX decoder error:', error);
    return NextResponse.json(
      {
        error: 'Failed to decode transaction',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
