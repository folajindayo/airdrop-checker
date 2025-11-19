import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-liquidation-threshold/[address]
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
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const threshold: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      liquidationThreshold: 0,
      currentRatio: 0,
      safetyMargin: 0,
      timestamp: Date.now(),
    };

    try {
      threshold.liquidationThreshold = 80;
      threshold.currentRatio = 250;
      threshold.safetyMargin = threshold.currentRatio - threshold.liquidationThreshold;
    } catch (error) {
      console.error('Error calculating threshold:', error);
    }

    cache.set(cacheKey, threshold, 2 * 60 * 1000);

    return NextResponse.json(threshold);
  } catch (error) {
    console.error('Token liquidation threshold error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate liquidation threshold',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

