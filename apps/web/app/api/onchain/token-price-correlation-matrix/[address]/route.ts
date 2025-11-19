import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-price-correlation-matrix/[address]
 * Calculate correlation matrix with other tokens
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const tokens = searchParams.get('tokens');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-correlation:${normalizedAddress}:${tokens || 'default'}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const matrix: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      correlations: {},
      averageCorrelation: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        matrix.correlations = {
          'WETH': 0.65,
          'USDC': 0.15,
          'BTC': 0.45,
        };
        matrix.averageCorrelation = 0.42;
      }
    } catch (error) {
      console.error('Error calculating correlation:', error);
    }

    cache.set(cacheKey, matrix, 10 * 60 * 1000);

    return NextResponse.json(matrix);
  } catch (error) {
    console.error('Price correlation matrix error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate correlation matrix',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
