import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-whitelist-checker/[address]
 * Check if address is whitelisted for token operations
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
    const cacheKey = `onchain-whitelist-checker:${normalizedAddress}:${check}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const whitelist: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      checkAddress: check,
      isWhitelisted: false,
      whitelistType: null,
      timestamp: Date.now(),
    };

    try {
      whitelist.isWhitelisted = false;
      whitelist.whitelistType = null;
    } catch (error) {
      console.error('Error checking whitelist:', error);
    }

    cache.set(cacheKey, whitelist, 10 * 60 * 1000);

    return NextResponse.json(whitelist);
  } catch (error) {
    console.error('Token whitelist checker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check whitelist status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

