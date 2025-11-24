import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-quality-score/[address]
 * Calculate comprehensive liquidity quality score
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
    const cacheKey = `onchain-liquidity-quality:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const quality: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      depthScore: 0,
      spreadScore: 0,
      qualityScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        quality.depthScore = Math.min(100, (liquidity / 1000000) * 10);
        quality.spreadScore = liquidity > 500000 ? 90 : 60;
        quality.qualityScore = (quality.depthScore + quality.spreadScore) / 2;
      }
    } catch (error) {
      console.error('Error calculating quality:', error);
    }

    cache.set(cacheKey, quality, 3 * 60 * 1000);

    return NextResponse.json(quality);
  } catch (error) {
    console.error('Liquidity quality score error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate liquidity quality score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
