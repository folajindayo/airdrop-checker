import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-price-efficiency/[address]
 * Measure price discovery efficiency
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
    const cacheKey = `onchain-price-efficiency:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const efficiency: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      efficiencyScore: 0,
      spreadPercent: 0,
      slippage: 0,
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
        efficiency.efficiencyScore = liquidity > 0 && volume > 0 ? 
          Math.min((volume / liquidity) * 100, 100) : 0;
      }
    } catch (error) {
      console.error('Error measuring efficiency:', error);
    }

    cache.set(cacheKey, efficiency, 5 * 60 * 1000);

    return NextResponse.json(efficiency);
  } catch (error) {
    console.error('Price efficiency error:', error);
    return NextResponse.json(
      {
        error: 'Failed to measure price efficiency',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





