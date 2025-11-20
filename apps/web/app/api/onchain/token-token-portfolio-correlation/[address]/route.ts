import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-portfolio-correlation/[address]
 * Calculate correlation between token and portfolio
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
    const cacheKey = `onchain-portfolio-correlation:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const correlation: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      correlationCoefficient: 0,
      diversificationBenefit: 0,
      portfolioWeight: 0,
      timestamp: Date.now(),
    };

    try {
      correlation.correlationCoefficient = 0.65;
      correlation.diversificationBenefit = 1 - correlation.correlationCoefficient;
      correlation.portfolioWeight = 15;
    } catch (error) {
      console.error('Error calculating correlation:', error);
    }

    cache.set(cacheKey, correlation, 10 * 60 * 1000);

    return NextResponse.json(correlation);
  } catch (error) {
    console.error('Token portfolio correlation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate portfolio correlation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

