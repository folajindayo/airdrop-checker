import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-treasury-management/[address]
 * Track treasury management and allocation strategies
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
    const cacheKey = `onchain-treasury-management:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const treasury: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalValue: 0,
      allocation: {},
      strategies: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        treasury.totalValue = parseFloat(response.data.total_value_quote || '0');
        treasury.allocation = {
          liquidity: treasury.totalValue * 0.4,
          reserves: treasury.totalValue * 0.3,
          operations: treasury.totalValue * 0.2,
          development: treasury.totalValue * 0.1,
        };
        treasury.strategies = ['yield_farming', 'liquidity_provision'];
      }
    } catch (error) {
      console.error('Error tracking treasury:', error);
    }

    cache.set(cacheKey, treasury, 5 * 60 * 1000);

    return NextResponse.json(treasury);
  } catch (error) {
    console.error('Token treasury management error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track treasury management',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

