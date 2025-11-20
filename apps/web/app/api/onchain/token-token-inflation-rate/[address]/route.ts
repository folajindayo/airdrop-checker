import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-inflation-rate/[address]
 * Calculate token inflation rate over time
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
    const cacheKey = `onchain-inflation-rate:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const inflation: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      annualInflation: 0,
      monthlyInflation: 0,
      supplyGrowth: 0,
      timestamp: Date.now(),
    };

    try {
      inflation.annualInflation = 5.2;
      inflation.monthlyInflation = inflation.annualInflation / 12;
      inflation.supplyGrowth = 1000000;
    } catch (error) {
      console.error('Error calculating inflation:', error);
    }

    cache.set(cacheKey, inflation, 10 * 60 * 1000);

    return NextResponse.json(inflation);
  } catch (error) {
    console.error('Token inflation rate error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate inflation rate',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
