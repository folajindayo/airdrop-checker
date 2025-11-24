import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-smart-contract-interaction-profiler/[address]
 * Profile smart contract interactions and call patterns
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
    const cacheKey = `onchain-interaction-profiler:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const profile: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      interactionCount: 0,
      uniqueContracts: 0,
      functionCalls: {},
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data && response.data.items) {
        profile.interactionCount = response.data.items.length;
        const contracts = new Set(response.data.items.map((tx: any) => tx.to_address));
        profile.uniqueContracts = contracts.size;
      }
    } catch (error) {
      console.error('Error profiling interactions:', error);
    }

    cache.set(cacheKey, profile, 5 * 60 * 1000);

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Smart contract interaction profiler error:', error);
    return NextResponse.json(
      {
        error: 'Failed to profile contract interactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

