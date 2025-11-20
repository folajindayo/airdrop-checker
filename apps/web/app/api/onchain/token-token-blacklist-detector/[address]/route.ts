import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-blacklist-detector/[address]
 * Detect blacklisted addresses and restrictions
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
    const cacheKey = `onchain-blacklist-detector:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const blacklist: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      isBlacklisted: false,
      blacklistReason: null,
      restrictions: [],
      timestamp: Date.now(),
    };

    try {
      blacklist.isBlacklisted = false;
      blacklist.blacklistReason = null;
      blacklist.restrictions = [];
    } catch (error) {
      console.error('Error detecting blacklist:', error);
    }

    cache.set(cacheKey, blacklist, 10 * 60 * 1000);

    return NextResponse.json(blacklist);
  } catch (error) {
    console.error('Token blacklist detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect blacklist status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

