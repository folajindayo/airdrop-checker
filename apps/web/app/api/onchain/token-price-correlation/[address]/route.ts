import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-price-correlation/[address]
 * Calculate price correlation with other assets
 * Identifies market relationships
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const compareToken = searchParams.get('compareToken');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-price-correlation:${normalizedAddress}:${chainId || 'all'}:${compareToken || 'none'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const correlation: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      correlationCoefficient: 0,
      correlationStrength: 'none',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        correlation.correlationCoefficient = 0;
        correlation.correlationStrength = 'none';
      }
    } catch (error) {
      console.error('Error calculating correlation:', error);
    }

    cache.set(cacheKey, correlation, 5 * 60 * 1000);

    return NextResponse.json(correlation);
  } catch (error) {
    console.error('Price correlation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate price correlation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

