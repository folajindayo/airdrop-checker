import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-trading-velocity/[address]
 * Measure trading velocity and circulation speed
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
    const cacheKey = `onchain-trading-velocity:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const velocity: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      velocity: 0,
      circulationSpeed: 0,
      turnoverRate: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const volume24h = parseFloat(response.data.volume_24h || '0');
        const marketCap = parseFloat(response.data.market_cap_quote || '0');
        velocity.turnoverRate = marketCap > 0 ? (volume24h / marketCap) * 100 : 0;
        velocity.velocity = volume24h;
        velocity.circulationSpeed = velocity.turnoverRate;
      }
    } catch (error) {
      console.error('Error measuring velocity:', error);
    }

    cache.set(cacheKey, velocity, 5 * 60 * 1000);

    return NextResponse.json(velocity);
  } catch (error) {
    console.error('Trading velocity error:', error);
    return NextResponse.json(
      {
        error: 'Failed to measure trading velocity',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





