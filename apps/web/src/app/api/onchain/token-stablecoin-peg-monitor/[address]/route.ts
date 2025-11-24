import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-stablecoin-peg-monitor/[address]
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
    const cacheKey = `onchain-peg-monitor:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const monitor: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      currentPrice: 1.0,
      pegDeviation: 0,
      stabilityScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data && response.data.prices) {
        monitor.currentPrice = parseFloat(response.data.prices[0]?.price || '1.0');
        monitor.pegDeviation = Math.abs((monitor.currentPrice - 1.0) / 1.0) * 100;
        monitor.stabilityScore = monitor.pegDeviation < 0.5 ? 95 : 100 - (monitor.pegDeviation * 10);
      }
    } catch (error) {
      console.error('Error monitoring peg:', error);
    }

    cache.set(cacheKey, monitor, 1 * 60 * 1000);

    return NextResponse.json(monitor);
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

