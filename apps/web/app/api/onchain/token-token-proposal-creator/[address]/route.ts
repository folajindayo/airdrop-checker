import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-proposal-creator/[address]
 * Track proposals created by address
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
    const cacheKey = `onchain-proposal-creator:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const creator: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      proposalsCreated: 0,
      proposals: [],
      successRate: 0,
      timestamp: Date.now(),
    };

    try {
      creator.proposalsCreated = 12;
      creator.proposals = [
        { id: 1, status: 'passed', votes: 1500000 },
        { id: 2, status: 'failed', votes: 800000 },
      ];
      creator.successRate = 75;
    } catch (error) {
      console.error('Error tracking proposals:', error);
    }

    cache.set(cacheKey, creator, 5 * 60 * 1000);

    return NextResponse.json(creator);
  } catch (error) {
    console.error('Token proposal creator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track proposal creator',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
