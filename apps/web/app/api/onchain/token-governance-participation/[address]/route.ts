import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-governance-participation/[address]
 * Track governance participation and voting activity
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
    const cacheKey = `onchain-governance:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const participation: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      votesCast: 0,
      proposalsCreated: 0,
      participationScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data && response.data.items) {
        const governanceTxs = response.data.items.filter((tx: any) => 
          tx.to_address && tx.to_address.toLowerCase().includes('governance'));
        participation.votesCast = governanceTxs.length;
        participation.participationScore = Math.min(100, participation.votesCast * 15);
      }
    } catch (error) {
      console.error('Error tracking governance:', error);
    }

    cache.set(cacheKey, participation, 10 * 60 * 1000);

    return NextResponse.json(participation);
  } catch (error) {
    console.error('Governance participation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track governance participation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

