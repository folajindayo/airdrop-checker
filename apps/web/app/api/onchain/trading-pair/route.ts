import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { TradingPairRequest, TradingPair } from '@/lib/onchain/types';

export async function POST(request: NextRequest) {
  try {
    const body: TradingPairRequest = await request.json();
    const { tokenA, tokenB, chainId } = body;

    if (!tokenA || !tokenB) {
      return NextResponse.json(
        { error: 'Missing required parameters: tokenA, tokenB' },
        { status: 400 }
      );
    }

    // Analyze trading pair (simplified)
    const pools: TradingPair['pools'] = [
      {
        dex: 'Uniswap V3',
        poolAddress: '0x0000000000000000000000000000000000000000' as Address,
        liquidity: '1000000000000000000000000',
        volume24h: '500000000000000000000000',
        feeTier: 3000,
      },
      {
        dex: 'SushiSwap',
        poolAddress: '0x1111111111111111111111111111111111111111' as Address,
        liquidity: '800000000000000000000000',
        volume24h: '400000000000000000000000',
        feeTier: 3000,
      },
    ];

    const bestLiquidity = pools.sort((a, b) => {
      return BigInt(b.liquidity) > BigInt(a.liquidity) ? 1 : -1;
    })[0].liquidity;

    const averagePrice = '1000';

    const pair: TradingPair = {
      tokenA,
      tokenB,
      pools,
      bestLiquidity,
      averagePrice,
    };

    return NextResponse.json({
      success: true,
      ...pair,
      type: 'trading-pair',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze trading pair' },
      { status: 500 }
    );
  }
}

