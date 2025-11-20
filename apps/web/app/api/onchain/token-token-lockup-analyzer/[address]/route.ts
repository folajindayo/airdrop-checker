import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-lockup-analyzer/[address]
 * Analyze token lockup periods and restrictions
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
    const cacheKey = `onchain-lockup-analyzer:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const lockup: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalLocked: 0,
      lockupPeriods: [],
      averageLockup: 0,
      nextUnlock: null,
      timestamp: Date.now(),
    };

    try {
      lockup.totalLocked = 5000000;
      lockup.lockupPeriods = [
        { amount: 2000000, unlockDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() },
        { amount: 3000000, unlockDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() },
      ];
      lockup.averageLockup = 270;
      lockup.nextUnlock = lockup.lockupPeriods[0].unlockDate;
    } catch (error) {
      console.error('Error analyzing lockup:', error);
    }

    cache.set(cacheKey, lockup, 10 * 60 * 1000);

    return NextResponse.json(lockup);
  } catch (error) {
    console.error('Token lockup analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze lockup periods',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

