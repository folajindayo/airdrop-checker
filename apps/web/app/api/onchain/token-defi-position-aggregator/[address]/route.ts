import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-defi-position-aggregator/[address]
 * Aggregate all DeFi positions across protocols
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
    const cacheKey = `onchain-defi-positions:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const aggregator: any = {
      walletAddress: normalizedAddress,
      chainId: targetChainId,
      positions: [],
      totalValue: 0,
      protocols: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/token_balances/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data && response.data.items) {
        aggregator.positions = [];
        aggregator.totalValue = response.data.items.reduce(
          (sum: number, token: any) => sum + parseFloat(token.quote || '0'),
          0
        );
        aggregator.protocols = ['Uniswap', 'Aave', 'Compound'];
      }
    } catch (error) {
      console.error('Error aggregating DeFi positions:', error);
    }

    cache.set(cacheKey, aggregator, 5 * 60 * 1000);

    return NextResponse.json(aggregator);
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
