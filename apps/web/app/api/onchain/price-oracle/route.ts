import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { PriceOracleRequest, PriceOracle } from '@/lib/onchain/types';

export async function POST(request: NextRequest) {
  try {
    const body: PriceOracleRequest = await request.json();
    const { tokenAddress, chainId, oracles } = body;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    // Aggregate price oracles (simplified)
    const defaultOracles = ['Chainlink', 'Uniswap V3', 'Band Protocol'];
    const targetOracles = oracles || defaultOracles;

    const prices = targetOracles.map((oracle, i) => ({
      oracle,
      price: (1000 + i * 5).toString(),
      lastUpdate: Date.now() - i * 60000,
      confidence: 90 - i * 5,
    }));

    const priceValues = prices.map(p => parseFloat(p.price));
    const aggregatedPrice = (priceValues.reduce((a, b) => a + b, 0) / priceValues.length).toString();
    const maxPrice = Math.max(...priceValues);
    const minPrice = Math.min(...priceValues);
    const priceDeviation = ((maxPrice - minPrice) / minPrice) * 100;
    const reliability = priceDeviation < 1 ? 'high' : priceDeviation < 5 ? 'medium' : 'low';

    const oracle: PriceOracle = {
      tokenAddress,
      prices,
      aggregatedPrice,
      priceDeviation,
      reliability,
    };

    return NextResponse.json({
      success: true,
      ...oracle,
      type: 'price-oracle',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to aggregate price oracles' },
      { status: 500 }
    );
  }
}

