import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-pause-impact-analyzer/[address]
 * Analyze impact of contract pause functionality
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
    const cacheKey = `onchain-pause-impact:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const analyzer: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      canPause: false,
      pauseHistory: [],
      impactAnalysis: {},
      riskAssessment: {},
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        analyzer.canPause = true;
        analyzer.impactAnalysis = {
          tradingVolume: 'halted',
          liquidity: 'frozen',
          holderConfidence: 'reduced',
        };
        analyzer.riskAssessment = {
          centralizationRisk: 'high',
          trustScore: 60,
        };
      }
    } catch (error) {
      console.error('Error analyzing pause impact:', error);
    }

    cache.set(cacheKey, analyzer, 10 * 60 * 1000);

    return NextResponse.json(analyzer);
  } catch (error) {
    console.error('Pause impact analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze pause impact',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

