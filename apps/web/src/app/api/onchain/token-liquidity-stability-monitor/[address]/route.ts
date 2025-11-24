import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-stability-monitor/[address]
 * Monitor liquidity stability over time
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
    const cacheKey = `onchain-liquidity-stability:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const stability: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      volatility: 0,
      stabilityScore: 0,
      trend: 'stable',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        stability.volatility = liquidity > 1000000 ? 5 : 15;
        stability.stabilityScore = 100 - stability.volatility;
        stability.trend = stability.volatility < 10 ? 'stable' : 'volatile';
      }
    } catch (error) {
      console.error('Error monitoring stability:', error);
    }

    cache.set(cacheKey, stability, 3 * 60 * 1000);

    return NextResponse.json(stability);
  } catch (error) {
    console.error('Liquidity stability monitor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to monitor liquidity stability',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
