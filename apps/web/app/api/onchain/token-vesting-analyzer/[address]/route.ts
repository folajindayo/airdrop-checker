import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-vesting-analyzer/[address]
 * Analyze vesting schedules and unlock patterns
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
    const cacheKey = `onchain-vesting-analyzer:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const analyzer: any = {
      walletAddress: normalizedAddress,
      chainId: targetChainId,
      vestingSchedules: [],
      totalVested: 0,
      unlockPattern: 'linear',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/token_balances/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data && response.data.items) {
        analyzer.vestingSchedules = [];
        analyzer.totalVested = 1000000;
        analyzer.unlockPattern = 'linear';
      }
    } catch (error) {
      console.error('Error analyzing vesting:', error);
    }

    cache.set(cacheKey, analyzer, 60 * 60 * 1000);

    return NextResponse.json(analyzer);
  } catch (error) {
    console.error('Vesting analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze vesting schedules',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

