import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-vote-power-history/[address]
 * Track historical voting power swings for a wallet
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const chainId = request.nextUrl.searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-vote-power-history:${normalizedAddress}:${chainId || 'all'}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const history: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      powerSnapshots: [],
      averagePower: 0,
      volatility: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/balances_changes/`,
        { 'page-size': 25 }
      );

      if (response.data && response.data.items) {
        const snapshots = response.data.items.slice(0, 12).map((item: any) => ({
          block: item.block_height,
          date: item.block_signed_at,
          balance: Number(item.balance || 0),
        }));
        history.powerSnapshots = snapshots;
        history.averagePower = Math.round(
          snapshots.reduce((sum: number, snap: any) => sum + snap.balance, 0) /
            (snapshots.length || 1)
        );
        history.volatility = Math.round(
          Math.sqrt(
            snapshots.reduce((sum: number, snap: any) =>
              sum + Math.pow(snap.balance - history.averagePower, 2),
            0) /
            (snapshots.length || 1)
          )
        );
      }
    } catch (error) {
      console.error('Voting power history fetch error:', error);
    }

    cache.set(cacheKey, history, 5 * 60 * 1000);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Voting power history error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze voting power history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
