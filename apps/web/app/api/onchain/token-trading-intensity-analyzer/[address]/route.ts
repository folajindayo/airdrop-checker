import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-trading-intensity-analyzer/[address]
 * Analyze trading intensity and frequency patterns
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
    const cacheKey = `onchain-trading-intensity:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const intensity: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      transactionsPerDay: 0,
      intensityScore: 0,
      category: 'moderate',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data && response.data.items) {
        intensity.transactionsPerDay = response.data.items.length / 30;
        intensity.intensityScore = Math.min(100, intensity.transactionsPerDay * 10);
        intensity.category = intensity.intensityScore > 70 ? 'high' : intensity.intensityScore > 40 ? 'moderate' : 'low';
      }
    } catch (error) {
      console.error('Error analyzing intensity:', error);
    }

    cache.set(cacheKey, intensity, 5 * 60 * 1000);

    return NextResponse.json(intensity);
  } catch (error) {
    console.error('Trading intensity analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze trading intensity',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
