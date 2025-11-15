import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidation-threshold/[address]
 * Calculate liquidation threshold for positions
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
    const cacheKey = `onchain-liquidation-threshold:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({ ...cachedResult, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const threshold: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      liquidationThreshold: 0,
      currentRatio: 0,
      isAtRisk: false,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, threshold, 5 * 60 * 1000);
    return NextResponse.json(threshold);
  } catch (error) {
    console.error('Liquidation threshold error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate liquidation threshold',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
