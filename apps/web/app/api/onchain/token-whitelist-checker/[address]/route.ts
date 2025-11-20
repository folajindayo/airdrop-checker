import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-whitelist-checker/[address]
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

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-whitelist-checker:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const checker: any = {
      walletAddress: normalizedAddress,
      chainId: targetChainId,
      isWhitelisted: false,
      whitelistType: null,
      eligibility: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 10 }
      );

      if (response.data && response.data.items) {
        checker.isWhitelisted = response.data.items.length > 0;
        checker.whitelistType = checker.isWhitelisted ? 'presale' : null;
        checker.eligibility = checker.isWhitelisted ? 100 : 0;
      }
    } catch (error) {
      console.error('Error checking whitelist:', error);
    }

    cache.set(cacheKey, checker, 10 * 60 * 1000);

    return NextResponse.json(checker);
  } catch (error) {
    console.error('Whitelist checker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check whitelist status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
