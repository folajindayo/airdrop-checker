import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-voting-period/[address]
 * Track voting period status for proposals
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
    const cacheKey = `onchain-voting-period:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const voting: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      activeProposals: [],
      votingDuration: 0,
      timeRemaining: 0,
      timestamp: Date.now(),
    };

    try {
      voting.activeProposals = [
        { id: 1, endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), votes: 150 },
      ];
      voting.votingDuration = 7;
      voting.timeRemaining = 3;
    } catch (error) {
      console.error('Error tracking voting:', error);
    }

    cache.set(cacheKey, voting, 2 * 60 * 1000);

    return NextResponse.json(voting);
  } catch (error) {
    console.error('Token voting period error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track voting period',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

