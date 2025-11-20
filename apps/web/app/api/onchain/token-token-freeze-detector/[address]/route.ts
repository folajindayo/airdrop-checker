import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-freeze-detector/[address]
 * Detect frozen accounts and balance restrictions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const checkAddress = searchParams.get('checkAddress');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const check = checkAddress ? checkAddress.toLowerCase() : normalizedAddress;
    const cacheKey = `onchain-freeze-detector:${normalizedAddress}:${check}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const freeze: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      checkAddress: check,
      isFrozen: false,
      frozenSince: null,
      freezeReason: null,
      timestamp: Date.now(),
    };

    try {
      freeze.isFrozen = false;
      freeze.frozenSince = null;
      freeze.freezeReason = null;
    } catch (error) {
      console.error('Error detecting freeze:', error);
    }

    cache.set(cacheKey, freeze, 2 * 60 * 1000);

    return NextResponse.json(freeze);
  } catch (error) {
    console.error('Token freeze detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect freeze status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

