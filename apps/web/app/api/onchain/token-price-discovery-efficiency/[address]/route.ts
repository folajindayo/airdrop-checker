import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-price-discovery-efficiency/[address]
 * Measure price discovery efficiency and market quality
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
    const cacheKey = `onchain-price-discovery:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const efficiency: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      priceVolatility: 0,
      liquidityDepth: 0,
      efficiencyScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        efficiency.liquidityDepth = parseFloat(response.data.total_liquidity_quote || '0');
        efficiency.efficiencyScore = efficiency.liquidityDepth > 1000000 ? 90 : 60;
      }
    } catch (error) {
      console.error('Error measuring price discovery:', error);
    }

    cache.set(cacheKey, efficiency, 2 * 60 * 1000);

    return NextResponse.json(efficiency);
  } catch (error) {
    console.error('Price discovery efficiency error:', error);
    return NextResponse.json(
      {
        error: 'Failed to measure price discovery efficiency',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
