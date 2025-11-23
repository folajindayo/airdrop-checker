import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { HolderActivityRequest, ActivityHeatmap } from '@/lib/onchain/types';

export async function POST(request: NextRequest) {
  try {
    const body: HolderActivityRequest = await request.json();
    const { tokenAddress, chainId, timeframe = '30d' } = body;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    // Generate activity heatmap (simplified)
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const data = Array.from({ length: days * 24 }, (_, i) => ({
      day: Math.floor(i / 24),
      hour: i % 24,
      activity: Math.floor(Math.random() * 100),
    }));

    const peakActivity = {
      day: 3,
      hour: 14,
      count: 95,
    };

    const heatmap: ActivityHeatmap = {
      tokenAddress: tokenAddress as Address,
      data,
      peakActivity,
    };

    return NextResponse.json({
      success: true,
      ...heatmap,
      type: 'activity-heatmap',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate activity heatmap' },
      { status: 500 }
    );
  }
}

