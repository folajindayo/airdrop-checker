import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-market-cap-efficiency-calculator/[address]
 * Calculate market cap efficiency metrics
 * Measures valuation relative to activity
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId') || '1';

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-mcap-efficiency:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const efficiency: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      efficiencyScore: 0,
      volumeToMarketCap: 0,
      holderToMarketCap: 0,
      timestamp: Date.now(),
    };

    try {
      const tokenResponse = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      const holdersResponse = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 1 }
      );

      if (tokenResponse.data?.items?.[0]) {
        const token = tokenResponse.data.items[0];
        const marketCap = parseFloat(token.market_cap_quote || '0');
        const volume24h = parseFloat(token.volume_24h_quote || '0');
        
        if (marketCap > 0) {
          efficiency.volumeToMarketCap = (volume24h / marketCap) * 100;
          
          if (holdersResponse.data?.items) {
            const holderCount = holdersResponse.data.items.length;
            efficiency.holderToMarketCap = marketCap > 0 
              ? marketCap / Math.max(holderCount, 1) 
              : 0;
          }
          
          efficiency.efficiencyScore = Math.min(efficiency.volumeToMarketCap * 10, 100);
        }
      }
    } catch (error) {
      console.error('Error calculating efficiency:', error);
    }

    cache.set(cacheKey, efficiency, 10 * 60 * 1000);

    return NextResponse.json(efficiency);
  } catch (error) {
    console.error('Market cap efficiency error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate market cap efficiency',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

