import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-acquisition-cost/[address]
 * Calculate cost of acquiring new token holders
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
    const cacheKey = `onchain-acquisition-cost:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const cost: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      costPerHolder: 0,
      totalAcquisitionCost: 0,
      efficiency: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const holderCount = parseFloat(response.data.holder_count || '0');
        const marketCap = parseFloat(response.data.market_cap_quote || '0');
        cost.costPerHolder = holderCount > 0 ? marketCap / holderCount : 0;
        cost.totalAcquisitionCost = marketCap * 0.1;
        cost.efficiency = cost.costPerHolder < 100 ? 90 : 60;
      }
    } catch (error) {
      console.error('Error calculating acquisition cost:', error);
    }

    cache.set(cacheKey, cost, 10 * 60 * 1000);

    return NextResponse.json(cost);
  } catch (error) {
    console.error('Holder acquisition cost error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate acquisition cost',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
