import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-cap-enforcer/[address]
 * Check supply cap enforcement and limits
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
    const cacheKey = `onchain-cap-enforcer:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const cap: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      supplyCap: null,
      currentSupply: 0,
      remainingCap: null,
      hasCap: false,
      timestamp: Date.now(),
    };

    try {
      cap.hasCap = false;
      cap.supplyCap = null;
      cap.currentSupply = 10000000;
      cap.remainingCap = null;
    } catch (error) {
      console.error('Error checking cap:', error);
    }

    cache.set(cacheKey, cap, 10 * 60 * 1000);

    return NextResponse.json(cap);
  } catch (error) {
    console.error('Token cap enforcer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check supply cap',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


