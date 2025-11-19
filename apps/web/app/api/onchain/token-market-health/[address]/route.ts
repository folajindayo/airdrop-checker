import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-market-health/[address]
 * Assess overall market health score
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
    const cacheKey = `onchain-market-health:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const health: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      healthScore: 0,
      liquidityScore: 0,
      volumeScore: 0,
      stabilityScore: 0,
      healthStatus: 'fair',
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
        const priceChange = Math.abs(parseFloat(response.data.price_change_24h || '0'));

        health.liquidityScore = Math.min((liquidity / 1000000) * 100, 100);
        health.volumeScore = Math.min((volume / 100000) * 100, 100);
        health.stabilityScore = Math.max(0, 100 - (priceChange * 5));
        health.healthScore = (health.liquidityScore + health.volumeScore + health.stabilityScore) / 3;
        health.healthStatus = health.healthScore > 75 ? 'excellent' :
                             health.healthScore > 50 ? 'good' :
                             health.healthScore > 25 ? 'fair' : 'poor';
      }
    } catch (error) {
      console.error('Error assessing health:', error);
    }

    cache.set(cacheKey, health, 5 * 60 * 1000);

    return NextResponse.json(health);
  } catch (error) {
    console.error('Market health error:', error);
    return NextResponse.json(
      {
        error: 'Failed to assess market health',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





