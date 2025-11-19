import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-mev-rewards/[address]
 * Track MEV rewards and block builder payments
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
    const cacheKey = `onchain-mev-rewards:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const tracking: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalMEVRewards: 0,
      blockRewards: [],
      avgRewardPerBlock: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const mevTxs = response.data.items.filter((tx: any) => 
          tx.gas_price && parseFloat(tx.gas_price) > 100
        );
        
        tracking.blockRewards = mevTxs.map((tx: any) => ({
          block: tx.block_number,
          reward: tx.gas_spent || '0',
        }));
        
        tracking.totalMEVRewards = mevTxs.reduce((sum: number, tx: any) => 
          sum + parseFloat(tx.gas_spent || '0'), 0
        );
        
        tracking.avgRewardPerBlock = mevTxs.length > 0 ? 
          tracking.totalMEVRewards / mevTxs.length : 0;
      }
    } catch (error) {
      console.error('Error tracking MEV rewards:', error);
    }

    cache.set(cacheKey, tracking, 5 * 60 * 1000);

    return NextResponse.json(tracking);
  } catch (error) {
    console.error('MEV rewards tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track MEV rewards',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






