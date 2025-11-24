import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-stablecoin-peg/[address]
 * Monitor stablecoin peg stability and deviations
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
    const cacheKey = `onchain-stablecoin-peg:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const monitoring: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      currentPrice: 1.0,
      pegDeviation: 0,
      pegStatus: 'stable',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.prices?.[0]) {
        monitoring.currentPrice = parseFloat(response.data.prices[0].price || '1.0');
        monitoring.pegDeviation = Math.abs(monitoring.currentPrice - 1.0) * 100;
        monitoring.pegStatus = monitoring.pegDeviation < 0.5 ? 'stable' : 
                               monitoring.pegDeviation < 2.0 ? 'deviating' : 'unpegged';
      }
    } catch (error) {
      console.error('Error monitoring stablecoin peg:', error);
    }

    cache.set(cacheKey, monitoring, 1 * 60 * 1000);

    return NextResponse.json(monitoring);
  } catch (error) {
    console.error('Stablecoin peg monitor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to monitor stablecoin peg',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






