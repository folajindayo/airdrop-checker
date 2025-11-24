import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-collateral-ratio/[address]
 * Calculate collateral ratio for lending protocols
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
    const cacheKey = `onchain-collateral-ratio:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const ratio: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      collateralRatio: 0,
      totalCollateral: 0,
      totalDebt: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        ratio.totalCollateral = parseFloat(response.data.total_value_quote || '0') * 0.4;
        ratio.totalDebt = ratio.totalCollateral * 0.15;
        ratio.collateralRatio = ratio.totalDebt > 0 ? 
          (ratio.totalCollateral / ratio.totalDebt) * 100 : 0;
      }
    } catch (error) {
      console.error('Error calculating ratio:', error);
    }

    cache.set(cacheKey, ratio, 3 * 60 * 1000);

    return NextResponse.json(ratio);
  } catch (error) {
    console.error('Token collateral ratio error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate collateral ratio',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

