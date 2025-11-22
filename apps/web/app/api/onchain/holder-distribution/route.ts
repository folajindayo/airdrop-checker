import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { HolderDistributionRequest, HolderDistribution, HolderSegment } from '@/lib/onchain/types';

export async function POST(request: NextRequest) {
  try {
    const body: HolderDistributionRequest = await request.json();
    const { tokenAddress, chainId, topN = 10 } = body;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    // Analyze holder distribution (simplified - would need on-chain data)
    const segments: HolderSegment[] = [
      { range: '0-1K', holders: 1000, percentage: 50, totalBalance: '1000000' },
      { range: '1K-10K', holders: 500, percentage: 30, totalBalance: '2000000' },
      { range: '10K-100K', holders: 100, percentage: 15, totalBalance: '3000000' },
      { range: '100K+', holders: 10, percentage: 5, totalBalance: '4000000' },
    ];

    const giniCoefficient = 0.65; // Would calculate from actual distribution

    const topHolders = Array.from({ length: topN }, (_, i) => ({
      address: `0x${i.toString(16).padStart(40, '0')}` as Address,
      balance: (1000000 - i * 10000).toString(),
      percentage: (10 - i * 0.5),
    }));

    const distribution: HolderDistribution = {
      tokenAddress: tokenAddress as Address,
      segments,
      giniCoefficient,
      topHolders,
    };

    return NextResponse.json({
      success: true,
      ...distribution,
      type: 'holder-distribution',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze holder distribution' },
      { status: 500 }
    );
  }
}

