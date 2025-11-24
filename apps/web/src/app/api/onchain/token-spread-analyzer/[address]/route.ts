import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-spread-analyzer/[address]
 * Analyze bid-ask spread metrics
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
    const cacheKey = `onchain-spread:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const spread: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      spreadPercent: 0,
      spreadQuality: 'medium',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        const volume = parseFloat(response.data.volume_24h || '0');
        spread.spreadPercent = liquidity > 0 ? (volume / liquidity) * 0.1 : 0.5;
        spread.spreadQuality = spread.spreadPercent < 0.1 ? 'tight' :
                               spread.spreadPercent < 0.5 ? 'medium' : 'wide';
      }
    } catch (error) {
      console.error('Error analyzing spread:', error);
    }

    cache.set(cacheKey, spread, 5 * 60 * 1000);

    return NextResponse.json(spread);
  } catch (error) {
    console.error('Spread analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze spread',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






