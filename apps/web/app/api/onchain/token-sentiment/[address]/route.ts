import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-sentiment/[address]
 * Analyze token sentiment based on holder behavior
 * Tracks buying and selling patterns
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
    const cacheKey = `onchain-token-sentiment:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const sentiment: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      sentimentScore: 50,
      indicators: {
        buyPressure: 0,
        sellPressure: 0,
        holderGrowth: 0,
      },
      trend: 'neutral',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        sentiment.indicators.holderGrowth = holders.length;
        
        const recentActivity = holders.filter((h: any) => {
          const lastTransfer = new Date(h.last_transferred_at || 0);
          const daysAgo = (Date.now() - lastTransfer.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo < 7;
        }).length;

        sentiment.indicators.buyPressure = recentActivity;
        sentiment.sentimentScore = calculateSentimentScore(sentiment.indicators);
        sentiment.trend = determineSentimentTrend(sentiment.sentimentScore);
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    }

    cache.set(cacheKey, sentiment, 3 * 60 * 1000);

    return NextResponse.json(sentiment);
  } catch (error) {
    console.error('Token sentiment analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze token sentiment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function calculateSentimentScore(indicators: any): number {
  let score = 50;
  if (indicators.buyPressure > indicators.sellPressure) score += 20;
  if (indicators.holderGrowth > 0) score += 10;
  return Math.max(0, Math.min(100, score));
}

function determineSentimentTrend(score: number): string {
  if (score > 70) return 'bullish';
  if (score < 30) return 'bearish';
  return 'neutral';
}

