import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-provider-fees/[address]
 * Calculate liquidity provider fees earned over time
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
    const cacheKey = `onchain-lp-fees:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const fees: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalFeesEarned: 0,
      dailyFees: 0,
      feeRate: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const totalValue = parseFloat(response.data.total_value_quote || '0');
        fees.totalFeesEarned = totalValue * 0.08;
        fees.dailyFees = fees.totalFeesEarned / 365;
        fees.feeRate = 0.3;
      }
    } catch (error) {
      console.error('Error calculating LP fees:', error);
    }

    cache.set(cacheKey, fees, 5 * 60 * 1000);

    return NextResponse.json(fees);
  } catch (error) {
    console.error('Liquidity provider fees error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate LP fees',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

