import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-price-discovery-quality-assessor/[address]
 * Assess price discovery quality
 * Measures market efficiency
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
    const cacheKey = `onchain-price-discovery-quality:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const quality: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      qualityScore: 0,
      marketCount: 0,
      priceConvergence: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/pools/`,
        { 'quote-currency': 'USD', 'page-size': 20 }
      );

      if (response.data?.items) {
        const pools = response.data.items;
        quality.marketCount = pools.length;
        
        if (pools.length > 1) {
          const prices = pools.map((p: any) => 
            parseFloat(p.token_0_price || p.token_1_price || '0')).filter((p: number) => p > 0);
          
          if (prices.length > 0) {
            const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
            const maxDeviation = Math.max(...prices.map(p => Math.abs(p - avgPrice)));
            quality.priceConvergence = avgPrice > 0 
              ? (1 - (maxDeviation / avgPrice)) * 100 
              : 0;
            
            quality.qualityScore = (quality.priceConvergence * 0.7) + (Math.min(quality.marketCount / 10, 1) * 30);
          }
        } else if (pools.length === 1) {
          quality.qualityScore = 30;
        }
      }
    } catch (error) {
      console.error('Error assessing quality:', error);
    }

    cache.set(cacheKey, quality, 10 * 60 * 1000);

    return NextResponse.json(quality);
  } catch (error) {
    console.error('Price discovery quality assessment error:', error);
    return NextResponse.json(
      {
        error: 'Failed to assess price discovery quality',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

