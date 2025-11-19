import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-value-score-calculator/[address]
 * Calculate holder value distribution score
 * Measures holder value concentration
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
    const cacheKey = `onchain-value-score:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const valueScore: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      valueScore: 0,
      distributionEvenness: 0,
      topHolderConcentration: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items && response.data.items.length > 0) {
        const holders = response.data.items;
        const values = holders.map((h: any) => parseFloat(h.value || '0')).sort((a, b) => b - a);
        const totalValue = values.reduce((a, b) => a + b, 0);
        
        if (totalValue > 0) {
          valueScore.topHolderConcentration = (values[0] / totalValue) * 100;
          
          const idealShare = 100 / holders.length;
          const actualShares = values.map(v => (v / totalValue) * 100);
          const deviation = actualShares.reduce((sum, s) => 
            sum + Math.abs(s - idealShare), 0) / holders.length;
          
          valueScore.distributionEvenness = Math.max(0, 100 - deviation);
          valueScore.valueScore = (valueScore.distributionEvenness * 0.6) + 
            ((100 - valueScore.topHolderConcentration) * 0.4);
        }
      }
    } catch (error) {
      console.error('Error calculating value score:', error);
    }

    cache.set(cacheKey, valueScore, 15 * 60 * 1000);

    return NextResponse.json(valueScore);
  } catch (error) {
    console.error('Holder value score calculation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate holder value score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

