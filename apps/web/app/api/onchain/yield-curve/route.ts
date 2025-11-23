import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { YieldCurveRequest, YieldCurve } from '@/lib/onchain/types';

export async function POST(request: NextRequest) {
  try {
    const body: YieldCurveRequest = await request.json();
    const { tokenAddress, chainId, timeframe = '30d' } = body;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    // Generate yield curve (simplified - would need historical yield data)
    const currentYield = 5.5;
    const averageYield = 5.2;
    const yieldHistory = Array.from({ length: 30 }, (_, i) => ({
      timestamp: Date.now() - (30 - i) * 86400000,
      yield: 5.0 + Math.random() * 1.0,
    }));

    const trend = currentYield > averageYield ? 'increasing' : currentYield < averageYield ? 'decreasing' : 'stable';

    const curve: YieldCurve = {
      tokenAddress: tokenAddress as Address,
      currentYield,
      averageYield,
      yieldHistory,
      trend,
    };

    return NextResponse.json({
      success: true,
      ...curve,
      type: 'yield-curve',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze yield curve' },
      { status: 500 }
    );
  }
}


