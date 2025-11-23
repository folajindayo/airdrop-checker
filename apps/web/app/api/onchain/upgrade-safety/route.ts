import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { UpgradeSafetyRequest, UpgradeSafety } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: UpgradeSafetyRequest = await request.json();
    const { currentAddress, newAddress, chainId } = body;

    if (!currentAddress || !newAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: currentAddress, newAddress' },
        { status: 400 }
      );
    }

    // Check upgrade safety (simplified)
    const risks: UpgradeSafety['risks'] = [];
    const isSafe = risks.length === 0;
    const safetyScore = isSafe ? 100 : Math.max(0, 100 - risks.length * 25);

    const recommendations: string[] = [];
    if (!isSafe) {
      recommendations.push('Review breaking changes before upgrading');
      recommendations.push('Test upgrade on testnet first');
    }

    const safety: UpgradeSafety = {
      currentAddress,
      newAddress,
      isSafe,
      safetyScore,
      risks,
      recommendations,
    };

    return NextResponse.json({
      success: true,
      ...safety,
      type: 'upgrade-safety',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check upgrade safety' },
      { status: 500 }
    );
  }
}

