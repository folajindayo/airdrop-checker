import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-trading-pattern-analyzer/[address]
 * Analyze trading patterns and behaviors
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
    const cacheKey = `onchain-trading-pattern:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const patterns: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      dominantPattern: 'normal',
      frequency: 0,
      patternScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data && response.data.items) {
        patterns.frequency = response.data.items.length;
        patterns.patternScore = Math.min(100, patterns.frequency * 2);
        patterns.dominantPattern = patterns.frequency > 50 ? 'high_frequency' : 'normal';
      }
    } catch (error) {
      console.error('Error analyzing patterns:', error);
    }

    cache.set(cacheKey, patterns, 5 * 60 * 1000);

    return NextResponse.json(patterns);
  } catch (error) {
    console.error('Trading pattern analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze trading patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
