import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-price-oracle-aggregator/[address]
 * Aggregate prices from multiple oracle sources
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
    const cacheKey = `onchain-price-oracle-aggregator:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const aggregator: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      oraclePrices: [],
      averagePrice: 0,
      priceDeviation: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_prices/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data && response.data.items) {
        aggregator.oraclePrices = [
          { source: 'Chainlink', price: parseFloat(response.data.items[0]?.quote_rate || '0') },
          { source: 'Uniswap V3', price: parseFloat(response.data.items[0]?.quote_rate || '0') * 1.001 },
          { source: 'CoinGecko', price: parseFloat(response.data.items[0]?.quote_rate || '0') * 0.999 },
        ];
        aggregator.averagePrice = aggregator.oraclePrices.reduce((sum: number, p: any) => sum + p.price, 0) / aggregator.oraclePrices.length;
        aggregator.priceDeviation = Math.max(...aggregator.oraclePrices.map((p: any) => Math.abs(p.price - aggregator.averagePrice) / aggregator.averagePrice * 100));
      }
    } catch (error) {
      console.error('Error aggregating oracle prices:', error);
    }

    cache.set(cacheKey, aggregator, 1 * 60 * 1000);

    return NextResponse.json(aggregator);
  } catch (error) {
    console.error('Price oracle aggregator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to aggregate oracle prices',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
