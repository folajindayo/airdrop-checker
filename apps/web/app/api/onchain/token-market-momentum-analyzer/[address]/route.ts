import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-market-momentum-analyzer/[address]
 * Analyze market momentum indicators
 * Measures trend strength and direction
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId') || '1';

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-market-momentum:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const momentum: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      momentumScore: 0,
      trendDirection: 'neutral',
      strength: 'weak',
      timestamp: Date.now(),
    };

    try {
      const tokenResponse = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (tokenResponse.data?.items?.[0]) {
        const token = tokenResponse.data.items[0];
        const priceChange24h = parseFloat(token.price_change_24h_quote || '0');
        const volume24h = parseFloat(token.volume_24h_quote || '0');
        const marketCap = parseFloat(token.market_cap_quote || '0');
        
        momentum.momentumScore = priceChange24h;
        
        if (priceChange24h > 10) {
          momentum.trendDirection = 'strong_bullish';
          momentum.strength = 'strong';
        } else if (priceChange24h > 5) {
          momentum.trendDirection = 'bullish';
          momentum.strength = 'moderate';
        } else if (priceChange24h < -10) {
          momentum.trendDirection = 'strong_bearish';
          momentum.strength = 'strong';
        } else if (priceChange24h < -5) {
          momentum.trendDirection = 'bearish';
          momentum.strength = 'moderate';
        }
        
        if (volume24h > 0 && marketCap > 0) {
          const volumeRatio = (volume24h / marketCap) * 100;
          if (volumeRatio > 20) momentum.strength = 'very_strong';
        }
      }
    } catch (error) {
      console.error('Error analyzing momentum:', error);
    }

    cache.set(cacheKey, momentum, 5 * 60 * 1000);

    return NextResponse.json(momentum);
  } catch (error) {
    console.error('Market momentum analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze market momentum',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

