import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-arbitrage-opportunities/[address]
 * Find arbitrage opportunities across DEXs
 * Compares prices across different exchanges
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
    const cacheKey = `onchain-arbitrage:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const opportunities: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      opportunities: [] as any[],
      bestBuyPrice: 0,
      bestSellPrice: 0,
      potentialProfit: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.pools) {
        const pools = response.data.pools;
        const prices = pools.map((pool: any) => ({
          dex: pool.exchange,
          price: parseFloat(pool.token_0_price_quote || pool.token_1_price_quote || '0'),
        }));

        if (prices.length > 1) {
          const sortedPrices = prices.sort((a, b) => a.price - b.price);
          opportunities.bestBuyPrice = sortedPrices[0].price;
          opportunities.bestSellPrice = sortedPrices[sortedPrices.length - 1].price;
          opportunities.potentialProfit = ((opportunities.bestSellPrice - opportunities.bestBuyPrice) / opportunities.bestBuyPrice) * 100;
          
          if (opportunities.potentialProfit > 1) {
            opportunities.opportunities.push({
              buyDex: sortedPrices[0].dex,
              sellDex: sortedPrices[sortedPrices.length - 1].dex,
              profitPercent: opportunities.potentialProfit,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error finding arbitrage:', error);
    }

    cache.set(cacheKey, opportunities, 1 * 60 * 1000);

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error('Arbitrage opportunities error:', error);
    return NextResponse.json(
      {
        error: 'Failed to find arbitrage opportunities',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

