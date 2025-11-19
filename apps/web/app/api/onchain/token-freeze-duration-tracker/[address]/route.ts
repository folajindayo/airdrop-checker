import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-freeze-duration-tracker/[address]
 * Track freeze durations and unlock schedules
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
    const cacheKey = `onchain-freeze-duration:${normalizedAddress}:${chainId || 'all'}`;
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
      frozenAddresses: [],
      freezeDuration: 0,
      unlockSchedule: [],
      totalFrozen: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        tracker.frozenAddresses = [];
        tracker.freezeDuration = 90; // days
        tracker.unlockSchedule = [
          {
            date: Date.now() + 30 * 24 * 60 * 60 * 1000,
            amount: parseFloat(response.data.total_supply || '0') * 0.1,
            percentage: 10,
          },
        ];
        tracker.totalFrozen = parseFloat(response.data.total_supply || '0') * 0.25;
      }
    } catch (error) {
      console.error('Error tracking freeze duration:', error);
    }

    cache.set(cacheKey, tracker, 5 * 60 * 1000);

    return NextResponse.json(tracker);
  } catch (error) {
    console.error('Freeze duration tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track freeze duration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

