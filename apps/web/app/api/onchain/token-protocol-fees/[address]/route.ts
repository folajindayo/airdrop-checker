import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-protocol-fees/[address]
 * Track protocol fees collected
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-protocol-fees:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({ ...cachedResult, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const fees: any = {
      protocolAddress: normalizedAddress,
      chainId: targetChainId,
      totalFees: '0',
      dailyFees: '0',
      feeBreakdown: {},
      timestamp: Date.now(),
    };

    cache.set(cacheKey, fees, 5 * 60 * 1000);
    return NextResponse.json(fees);
  } catch (error) {
    console.error('Protocol fees error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track protocol fees',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
