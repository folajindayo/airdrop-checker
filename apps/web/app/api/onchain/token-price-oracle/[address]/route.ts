import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-price-oracle/[address]
 * Get token prices from on-chain oracles and APIs
 * Uses GoldRush API for price data
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
    const cacheKey = `onchain-token-price-oracle:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChains = chainId
      ? SUPPORTED_CHAINS.filter((c) => c.id === parseInt(chainId))
      : SUPPORTED_CHAINS;

    const prices: any[] = [];

    for (const chain of targetChains) {
      try {
        // Get token price from GoldRush
        const response = await goldrushClient.get(
          `/v2/${chain.id}/tokens/${normalizedAddress}/token_prices/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
          }
        );

        if (response.data?.items && response.data.items.length > 0) {
          const tokenData = response.data.items[0];
          
          prices.push({
            chainId: chain.id,
            chainName: chain.name,
            tokenAddress: normalizedAddress,
            tokenName: tokenData.contract_name,
            symbol: tokenData.contract_ticker_symbol,
            priceUSD: tokenData.quote_rate,
            priceFormatted: `$${tokenData.quote_rate?.toFixed(6) || '0'}`,
            marketCap: tokenData.quote_rate_24h,
            volume24h: tokenData.total_volume_24h,
            change24h: tokenData.quote_rate_24h 
              ? ((tokenData.quote_rate - tokenData.quote_rate_24h) / tokenData.quote_rate_24h * 100)
              : null,
            lastUpdated: tokenData.last_updated,
          });
        }
      } catch (error) {
        console.error(`Error fetching token price on ${chain.name}:`, error);
      }
    }

    const result = {
      tokenAddress: normalizedAddress,
      prices,
      averagePrice: prices.length > 0
        ? prices.reduce((sum, p) => sum + (p.priceUSD || 0), 0) / prices.length
        : null,
      timestamp: Date.now(),
    };

    // Cache for 1 minute (prices change frequently)
    cache.set(cacheKey, result, 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain token price oracle API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch token prices',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

