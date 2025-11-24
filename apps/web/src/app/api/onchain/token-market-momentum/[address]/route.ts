import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-market-momentum/[address]
 * Measure market momentum indicators
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
    const cacheKey = `onchain-market-momentum:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const momentum: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      momentumScore: 0,
      priceMomentum: 0,
      volumeMomentum: 0,
      momentumDirection: 'neutral',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const priceChange = parseFloat(response.data.price_change_24h || '0');
        const volume = parseFloat(response.data.volume_24h || '0');
        momentum.priceMomentum = priceChange;
        momentum.volumeMomentum = volume > 1000000 ? 100 : (volume / 10000) * 100;
        momentum.momentumScore = (Math.abs(momentum.priceMomentum) + momentum.volumeMomentum) / 2;
        momentum.momentumDirection = priceChange > 5 ? 'bullish' :
                                     priceChange > 0 ? 'slightly_bullish' :
                                     priceChange > -5 ? 'neutral' :
                                     priceChange > -10 ? 'slightly_bearish' : 'bearish';
      }
    } catch (error) {
      console.error('Error measuring momentum:', error);
    }

    cache.set(cacheKey, momentum, 5 * 60 * 1000);

    return NextResponse.json(momentum);
  } catch (error) {
    console.error('Market momentum error:', error);
    return NextResponse.json(
      {
        error: 'Failed to measure market momentum',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






