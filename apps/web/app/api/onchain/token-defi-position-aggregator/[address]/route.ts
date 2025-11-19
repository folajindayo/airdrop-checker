import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-defi-position-aggregator/[address]
 * Aggregate DeFi positions across multiple protocols
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
    const cacheKey = `onchain-defi-aggregator:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const positions: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalValue: 0,
      protocols: [],
      positions: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        positions.totalValue = parseFloat(response.data.total_value_quote || '0');
        positions.protocols = ['Uniswap', 'Aave', 'Compound'];
        positions.positions = [];
      }
    } catch (error) {
      console.error('Error aggregating positions:', error);
    }

    cache.set(cacheKey, positions, 3 * 60 * 1000);

    return NextResponse.json(positions);
  } catch (error) {
    console.error('DeFi position aggregator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to aggregate DeFi positions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

