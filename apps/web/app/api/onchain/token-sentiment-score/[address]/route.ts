import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-sentiment-score/[address]
 * Calculate token sentiment based on onchain metrics
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
    const cacheKey = `onchain-sentiment:${normalizedAddress}:${chainId || 'all'}`;
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
      sentimentScore: 0,
      sentimentLabel: 'neutral',
      priceChange24h: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const priceChange = parseFloat(response.data.price_change_24h || '0');
        sentiment.priceChange24h = priceChange;
        sentiment.sentimentScore = Math.max(-100, Math.min(100, priceChange * 5));
        sentiment.sentimentLabel = sentiment.sentimentScore > 50 ? 'very_bullish' :
                                   sentiment.sentimentScore > 20 ? 'bullish' :
                                   sentiment.sentimentScore > -20 ? 'neutral' :
                                   sentiment.sentimentScore > -50 ? 'bearish' : 'very_bearish';
      }
    } catch (error) {
      console.error('Error calculating sentiment:', error);
    }

    cache.set(cacheKey, sentiment, 5 * 60 * 1000);

    return NextResponse.json(sentiment);
  } catch (error) {
    console.error('Sentiment score error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate sentiment score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

