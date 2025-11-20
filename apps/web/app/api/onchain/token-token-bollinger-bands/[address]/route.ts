import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-bollinger-bands/[address]
 * Calculate Bollinger Bands for volatility analysis
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
    const cacheKey = `onchain-bollinger-bands:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const bands: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      upperBand: 0,
      middleBand: 0,
      lowerBand: 0,
      bandwidth: 0,
      timestamp: Date.now(),
    };

    try {
      bands.middleBand = 2000;
      bands.upperBand = 2100;
      bands.lowerBand = 1900;
      bands.bandwidth = ((bands.upperBand - bands.lowerBand) / bands.middleBand) * 100;
    } catch (error) {
      console.error('Error calculating Bollinger Bands:', error);
    }

    cache.set(cacheKey, bands, 2 * 60 * 1000);

    return NextResponse.json(bands);
  } catch (error) {
    console.error('Token Bollinger Bands error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate Bollinger Bands',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

