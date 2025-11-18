import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-value-distribution-advanced/[address]
 * Advanced value distribution analysis
 * Calculates Gini coefficient and distribution metrics
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
    const cacheKey = `onchain-value-dist-adv:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const distribution: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      giniCoefficient: 0,
      herfindahlIndex: 0,
      top10Concentration: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 1000 }
      );

      if (response.data?.items && response.data.items.length > 0) {
        const holders = response.data.items;
        const values = holders.map((h: any) => parseFloat(h.value || '0')).sort((a, b) => a - b);
        const totalValue = values.reduce((a, b) => a + b, 0);
        
        if (totalValue > 0) {
          const top10 = values.slice(-10).reduce((a, b) => a + b, 0);
          distribution.top10Concentration = (top10 / totalValue) * 100;
          
          const shares = values.map(v => v / totalValue);
          distribution.herfindahlIndex = shares.reduce((sum, s) => sum + s * s, 0) * 10000;
          
          let giniSum = 0;
          for (let i = 0; i < values.length; i++) {
            for (let j = 0; j < values.length; j++) {
              giniSum += Math.abs(values[i] - values[j]);
            }
          }
          distribution.giniCoefficient = giniSum / (2 * values.length * totalValue);
        }
      }
    } catch (error) {
      console.error('Error calculating distribution:', error);
    }

    cache.set(cacheKey, distribution, 15 * 60 * 1000);

    return NextResponse.json(distribution);
  } catch (error) {
    console.error('Value distribution analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze value distribution',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

