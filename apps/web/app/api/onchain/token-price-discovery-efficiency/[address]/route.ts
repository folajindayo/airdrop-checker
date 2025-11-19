import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-price-discovery-efficiency/[address]
 * Measure price discovery efficiency across markets
 * Analyzes market efficiency and price convergence
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
    const cacheKey = `onchain-price-discovery:${normalizedAddress}:${chainId}`;
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
      priceSpread: 0,
      marketCount: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/pools/`,
        { 'quote-currency': 'USD', 'page-size': 20 }
      );

      if (response.data?.items) {
        const pools = response.data.items;
        efficiency.marketCount = pools.length;
        
        if (pools.length > 1) {
          const prices = pools.map((p: any) => 
            parseFloat(p.token_0_price || p.token_1_price || '0')).filter((p: number) => p > 0);
          
          if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
            
            efficiency.priceSpread = avgPrice > 0 
              ? ((maxPrice - minPrice) / avgPrice) * 100 
              : 0;
            
            efficiency.efficiencyScore = Math.max(0, 100 - efficiency.priceSpread * 2);
          }
        } else if (pools.length === 1) {
          efficiency.efficiencyScore = 50;
        }
      }
    } catch (error) {
      console.error('Error analyzing price discovery:', error);
    }

    cache.set(cacheKey, efficiency, 5 * 60 * 1000);

    return NextResponse.json(efficiency);
  } catch (error) {
    console.error('Price discovery efficiency error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze price discovery efficiency',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

