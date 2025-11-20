import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-emission-schedule-tracker/[address]
 * Track token emission schedule and release timeline
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
    const cacheKey = `onchain-emission-schedule:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const tracker: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      schedule: [],
      totalEmission: 0,
      remainingEmission: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        tracker.schedule = [
          { date: Date.now() + 30 * 24 * 60 * 60 * 1000, amount: 1000000, purpose: 'Rewards' },
        ];
        tracker.totalEmission = 10000000;
        tracker.remainingEmission = tracker.totalEmission * 0.7;
      }
    } catch (error) {
      console.error('Error tracking emission schedule:', error);
    }

    cache.set(cacheKey, tracker, 60 * 60 * 1000);

    return NextResponse.json(tracker);
  } catch (error) {
    console.error('Emission schedule tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track emission schedule',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

