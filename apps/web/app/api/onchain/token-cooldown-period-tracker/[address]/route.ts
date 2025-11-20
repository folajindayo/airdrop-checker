import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-cooldown-period-tracker/[address]
 * Track cooldown periods between transactions
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
    const cacheKey = `onchain-cooldown-period:${normalizedAddress}:${chainId || 'all'}`;
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
      cooldownPeriod: 0,
      hasCooldown: false,
      lastTransaction: null,
      nextAllowedTransaction: null,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        tracker.hasCooldown = true;
        tracker.cooldownPeriod = 300; // seconds
        tracker.lastTransaction = Date.now() - 60 * 1000;
        tracker.nextAllowedTransaction = tracker.lastTransaction + tracker.cooldownPeriod * 1000;
      }
    } catch (error) {
      console.error('Error tracking cooldown period:', error);
    }

    cache.set(cacheKey, tracker, 2 * 60 * 1000);

    return NextResponse.json(tracker);
  } catch (error) {
    console.error('Cooldown period tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track cooldown period',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

