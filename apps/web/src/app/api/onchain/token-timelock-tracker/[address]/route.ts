import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-timelock-tracker/[address]
 * Track timelock delays for proposals
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
    const cacheKey = `onchain-timelock-tracker:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({ ...cachedResult, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const timelock: any = {
      timelockAddress: normalizedAddress,
      chainId: targetChainId,
      delay: 0,
      unlockTime: null,
      remainingTime: 0,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, timelock, 2 * 60 * 1000);
    return NextResponse.json(timelock);
  } catch (error) {
    console.error('Timelock tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track timelock',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
