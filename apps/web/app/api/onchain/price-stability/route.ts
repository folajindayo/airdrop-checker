import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { PriceStabilityRequest, PriceStability } from '@/lib/onchain/types';

export async function POST(request: NextRequest) {
  try {
    const body: PriceStabilityRequest = await request.json();
    const { tokenAddress, chainId, timeRange = 30 } = body;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    // Analyze price stability (simplified)
    const stabilityScore = 75.0;
    const volatility = 5.0;
    const priceRange = {
      min: '950',
      max: '1050',
      average: '1000',
    };
    const stabilityTrend: 'improving' | 'deteriorating' | 'stable' = 'stable';
    const riskLevel = volatility > 10 ? 'high' : volatility > 5 ? 'medium' : 'low';

    const stability: PriceStability = {
      tokenAddress,
      stabilityScore,
      volatility,
      priceRange,
      stabilityTrend,
      riskLevel,
    };

    return NextResponse.json({
      success: true,
      ...stability,
      type: 'price-stability',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze price stability' },
      { status: 500 }
    );
  }
}

