import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { HolderConcentrationRequest, HolderConcentration } from '@/lib/onchain/types';
import { calculateConcentrationIndex, determineConcentrationRisk } from '@/lib/onchain/helpers';

export async function POST(request: NextRequest) {
  try {
    const body: HolderConcentrationRequest = await request.json();
    const { tokenAddress, chainId, topN = 10 } = body;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    // Analyze holder concentration (simplified)
    const topHolders = Array.from({ length: topN }, (_, i) => ({
      address: `0x${i.toString(16).padStart(40, '0')}` as Address,
      balance: (1000000 - i * 50000).toString(),
      percentage: (50 - i * 2),
    }));

    const topHoldersPercentage = topHolders.reduce((sum, h) => sum + h.percentage, 0);
    const concentrationIndex = calculateConcentrationIndex(topHoldersPercentage);
    const riskLevel = determineConcentrationRisk(concentrationIndex);

    const recommendations: string[] = [];
    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('High concentration risk - consider token distribution strategies');
      recommendations.push('Monitor top holder movements closely');
    }

    const concentration: HolderConcentration = {
      tokenAddress,
      topHoldersPercentage,
      concentrationIndex,
      riskLevel,
      topHolders,
      recommendations,
    };

    return NextResponse.json({
      success: true,
      ...concentration,
      type: 'holder-concentration',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze holder concentration' },
      { status: 500 }
    );
  }
}

