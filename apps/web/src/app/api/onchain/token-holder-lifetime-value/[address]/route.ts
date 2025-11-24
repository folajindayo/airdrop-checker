import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-lifetime-value/[address]
 * Calculate lifetime value metrics for token holders
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
    const cacheKey = `onchain-holder-ltv:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const ltv: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalValueTransacted: 0,
      averageHoldingPeriod: 0,
      lifetimeValue: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        ltv.totalValueTransacted = parseFloat(response.data.total_value_transacted_quote || '0');
        ltv.lifetimeValue = ltv.totalValueTransacted;
      }
    } catch (error) {
      console.error('Error calculating lifetime value:', error);
    }

    cache.set(cacheKey, ltv, 10 * 60 * 1000);

    return NextResponse.json(ltv);
  } catch (error) {
    console.error('Holder lifetime value error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate holder lifetime value',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
