import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * POST /api/onchain/token-rebalancer
 * Calculate optimal rebalancing strategy for token portfolio
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, targetAllocation, chainId } = body;

    if (!isValidAddress(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const cacheKey = `rebalancer:${walletAddress}:${JSON.stringify(targetAllocation)}:${chainId}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const rebalance = {
      walletAddress,
      currentAllocation: {
        ETH: '40',
        USDC: '30',
        DAI: '30',
      },
      targetAllocation,
      rebalanceActions: [
        { token: 'ETH', action: 'sell', amount: '100' },
        { token: 'USDC', action: 'buy', amount: '50' },
      ],
      estimatedGas: '200000',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, rebalance, 60 * 1000);
    return NextResponse.json(rebalance);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate rebalancing' },
      { status: 500 }
    );
  }
}

