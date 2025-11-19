import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-contract-interaction-counter/[address]
 * Count contract interactions and call frequency
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
    const cacheKey = `onchain-interaction-counter:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const counter: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalInteractions: 0,
      uniqueCallers: 0,
      interactionFrequency: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data && response.data.items) {
        counter.totalInteractions = response.data.items.length;
        const callers = new Set(response.data.items.map((tx: any) => tx.from_address));
        counter.uniqueCallers = callers.size;
        counter.interactionFrequency = counter.totalInteractions / 30;
      }
    } catch (error) {
      console.error('Error counting interactions:', error);
    }

    cache.set(cacheKey, counter, 5 * 60 * 1000);

    return NextResponse.json(counter);
  } catch (error) {
    console.error('Token contract interaction counter error:', error);
    return NextResponse.json(
      {
        error: 'Failed to count contract interactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

