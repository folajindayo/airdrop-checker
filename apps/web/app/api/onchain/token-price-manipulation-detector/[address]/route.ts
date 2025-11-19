import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-price-manipulation-detector/[address]
 * Detect price manipulation patterns in token trading
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
    const cacheKey = `onchain-price-manipulation:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const detection: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      manipulationDetected: false,
      manipulationScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const priceChange24h = Math.abs(parseFloat(response.data.prices?.[0]?.price_change_24h || '0'));
        const volume24h = parseFloat(response.data.total_liquidity_quote || '0');
        
        let score = 0;
        if (priceChange24h > 100) score += 50;
        if (volume24h < 10000 && priceChange24h > 50) score += 30;
        
        detection.manipulationScore = score;
        detection.manipulationDetected = score > 50;
      }
    } catch (error) {
      console.error('Error detecting price manipulation:', error);
    }

    cache.set(cacheKey, detection, 5 * 60 * 1000);

    return NextResponse.json(detection);
  } catch (error) {
    console.error('Price manipulation detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect price manipulation patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






