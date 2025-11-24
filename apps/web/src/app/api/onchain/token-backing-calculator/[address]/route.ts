import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-backing-calculator/[address]
 * Calculate token backing value and collateralization
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
    const cacheKey = `onchain-backing:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({ ...cachedResult, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const backing: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      backingValue: '0',
      collateralizationRatio: 0,
      backingAssets: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const marketCap = parseFloat(response.data.market_cap_quote || '0');
        backing.backingValue = marketCap.toFixed(2);
      }
    } catch (error) {
      console.error('Error calculating backing:', error);
    }

    cache.set(cacheKey, backing, 5 * 60 * 1000);
    return NextResponse.json(backing);
  } catch (error) {
    console.error('Backing calculator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate backing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
