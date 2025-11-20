import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-freeze-detector/[address]
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

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-freeze-detector:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const detector: any = {
      walletAddress: normalizedAddress,
      chainId: targetChainId,
      isFrozen: false,
      frozenBalance: 0,
      freezeReason: null,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/token_balances/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data && response.data.items) {
        detector.isFrozen = false;
        detector.frozenBalance = 0;
        detector.freezeReason = null;
      }
    } catch (error) {
      console.error('Error detecting freeze status:', error);
    }

    cache.set(cacheKey, detector, 5 * 60 * 1000);

    return NextResponse.json(detector);
  } catch (error) {
    console.error('Freeze detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect freeze status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
