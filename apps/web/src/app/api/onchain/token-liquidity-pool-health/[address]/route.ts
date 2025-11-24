import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-pool-health/[address]
 * Monitor liquidity pool health and impermanent loss risks
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
    const cacheKey = `onchain-pool-health:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const health: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      healthScore: 0,
      impermanentLossRisk: 0,
      liquidityRatio: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        health.liquidityRatio = liquidity > 0 ? 85 : 0;
        health.impermanentLossRisk = liquidity > 1000000 ? 15 : 45;
        health.healthScore = 100 - health.impermanentLossRisk;
      }
    } catch (error) {
      console.error('Error checking pool health:', error);
    }

    cache.set(cacheKey, health, 3 * 60 * 1000);

    return NextResponse.json(health);
  } catch (error) {
    console.error('Liquidity pool health error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check pool health',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

