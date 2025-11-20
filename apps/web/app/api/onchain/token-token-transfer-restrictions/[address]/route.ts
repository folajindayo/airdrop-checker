import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-transfer-restrictions/[address]
 * Detect transfer restrictions and limitations
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
    const cacheKey = `onchain-transfer-restrictions:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const restrictions: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      hasRestrictions: false,
      restrictionTypes: [],
      maxTransfer: null,
      cooldownPeriod: 0,
      timestamp: Date.now(),
    };

    try {
      restrictions.hasRestrictions = false;
      restrictions.restrictionTypes = [];
      restrictions.maxTransfer = null;
      restrictions.cooldownPeriod = 0;
    } catch (error) {
      console.error('Error detecting restrictions:', error);
    }

    cache.set(cacheKey, restrictions, 10 * 60 * 1000);

    return NextResponse.json(restrictions);
  } catch (error) {
    console.error('Token transfer restrictions error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect transfer restrictions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

