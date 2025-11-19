import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-quality/[address]
 * Assess liquidity quality metrics
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
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      qualityScore: 0,
      depthScore: 0,
      stabilityScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        const volume24h = parseFloat(response.data.volume_24h || '0');
        quality.depthScore = liquidity > 0 ? Math.min((liquidity / 1000000) * 100, 100) : 0;
        quality.stabilityScore = liquidity > 0 ? Math.min((volume24h / liquidity) * 100, 100) : 0;
        quality.qualityScore = (quality.depthScore + quality.stabilityScore) / 2;
      }
    } catch (error) {
      console.error('Error assessing quality:', error);
    }

    cache.set(cacheKey, quality, 5 * 60 * 1000);

    return NextResponse.json(quality);
  } catch (error) {
    console.error('Liquidity quality error:', error);
    return NextResponse.json(
      {
        error: 'Failed to assess liquidity quality',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






