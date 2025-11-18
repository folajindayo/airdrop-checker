import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-price-correlation-matrix/[address]
 * Calculate price correlation with other tokens
 * Measures market relationship patterns
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId') || '1';
    const compareToken = searchParams.get('compareToken');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-correlation:${normalizedAddress}:${chainId}:${compareToken || 'none'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const correlation: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      correlationScore: 0,
      relationship: 'neutral',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 30 }
      );

      if (response.data?.items) {
        const prices = response.data.items
          .map((tx: any) => parseFloat(tx.value_quote || '0'))
          .filter((p: number) => p > 0);
        
        if (prices.length > 1 && compareToken) {
          const compareResponse = await goldrushClient.get(
            `/v2/${targetChainId}/tokens/${compareToken}/transactions/`,
            { 'quote-currency': 'USD', 'page-size': 30 }
          );
          
          if (compareResponse.data?.items) {
            const comparePrices = compareResponse.data.items
              .map((tx: any) => parseFloat(tx.value_quote || '0'))
              .filter((p: number) => p > 0);
            
            if (prices.length === comparePrices.length) {
              const returns1 = [];
              const returns2 = [];
              
              for (let i = 1; i < prices.length; i++) {
                if (prices[i - 1] > 0 && comparePrices[i - 1] > 0) {
                  returns1.push((prices[i] - prices[i - 1]) / prices[i - 1]);
                  returns2.push((comparePrices[i] - comparePrices[i - 1]) / comparePrices[i - 1]);
                }
              }
              
              if (returns1.length > 0) {
                const avg1 = returns1.reduce((a, b) => a + b, 0) / returns1.length;
                const avg2 = returns2.reduce((a, b) => a + b, 0) / returns2.length;
                
                const covariance = returns1.reduce((sum, r, i) => 
                  sum + (r - avg1) * (returns2[i] - avg2), 0) / returns1.length;
                
                const std1 = Math.sqrt(returns1.reduce((sum, r) => 
                  sum + Math.pow(r - avg1, 2), 0) / returns1.length);
                const std2 = Math.sqrt(returns2.reduce((sum, r) => 
                  sum + Math.pow(r - avg2, 2), 0) / returns2.length);
                
                if (std1 > 0 && std2 > 0) {
                  correlation.correlationScore = (covariance / (std1 * std2)) * 100;
                  
                  if (correlation.correlationScore > 70) correlation.relationship = 'strong_positive';
                  else if (correlation.correlationScore > 30) correlation.relationship = 'positive';
                  else if (correlation.correlationScore < -70) correlation.relationship = 'strong_negative';
                  else if (correlation.correlationScore < -30) correlation.relationship = 'negative';
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error calculating correlation:', error);
    }

    cache.set(cacheKey, correlation, 10 * 60 * 1000);

    return NextResponse.json(correlation);
  } catch (error) {
    console.error('Price correlation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate price correlation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

