import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-trading-pattern-analyzer/[address]
 * Analyze trading patterns and strategies
 * Identifies trading behavior types
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
    const cacheKey = `onchain-trading-pattern:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const patterns: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      patternType: 'unknown',
      frequency: 0,
      averageSize: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const transactions = response.data.items;
        patterns.frequency = transactions.length;
        
        const sizes = transactions.map((tx: any) => 
          parseFloat(tx.value_quote || '0')).filter((s: number) => s > 0);
        
        if (sizes.length > 0) {
          patterns.averageSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
          
          const variance = sizes.reduce((sum, s) => 
            sum + Math.pow(s - patterns.averageSize, 2), 0) / sizes.length;
          const stdDev = Math.sqrt(variance);
          
          if (stdDev / patterns.averageSize < 0.3) {
            patterns.patternType = 'consistent';
          } else if (transactions.length > 20) {
            patterns.patternType = 'frequent';
          } else {
            patterns.patternType = 'irregular';
          }
        }
      }
    } catch (error) {
      console.error('Error analyzing patterns:', error);
    }

    cache.set(cacheKey, patterns, 10 * 60 * 1000);

    return NextResponse.json(patterns);
  } catch (error) {
    console.error('Trading pattern analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze trading patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

