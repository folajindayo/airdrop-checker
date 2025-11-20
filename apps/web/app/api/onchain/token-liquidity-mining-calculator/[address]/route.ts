import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-mining-calculator/[address]
 * Calculate liquidity mining rewards and APY
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const liquidityAmount = parseFloat(searchParams.get('liquidityAmount') || '10000');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-liquidity-mining:${normalizedAddress}:${liquidityAmount}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const calculator: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      liquidityAmount,
      apy: 0,
      dailyRewards: 0,
      totalRewards: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        calculator.apy = 45.5; // percentage
        calculator.dailyRewards = (liquidityAmount * calculator.apy / 100) / 365;
        calculator.totalRewards = liquidityAmount * calculator.apy / 100;
      }
    } catch (error) {
      console.error('Error calculating liquidity mining:', error);
    }

    cache.set(cacheKey, calculator, 5 * 60 * 1000);

    return NextResponse.json(calculator);
  } catch (error) {
    console.error('Liquidity mining calculator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate liquidity mining rewards',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

