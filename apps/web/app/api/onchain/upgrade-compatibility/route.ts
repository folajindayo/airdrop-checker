import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { UpgradeCompatibilityRequest, UpgradeCompatibility, CompatibilityIssue } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: UpgradeCompatibilityRequest = await request.json();
    const { currentAddress, newAddress, chainId } = body;

    if (!currentAddress || !newAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: currentAddress, newAddress' },
        { status: 400 }
      );
    }

    const chain = chains[chainId as keyof typeof chains];
    if (!chain) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chainId}` },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    // Check compatibility (simplified)
    const issues: CompatibilityIssue[] = [];
    
    const currentCode = await publicClient.getBytecode({ address: currentAddress });
    const newCode = await publicClient.getBytecode({ address: newAddress });

    if (currentCode && newCode && currentCode.length !== newCode.length) {
      issues.push({
        type: 'storage',
        description: 'Storage layout may have changed',
        severity: 'high',
      });
    }

    const isCompatible = issues.length === 0;
    const compatibilityScore = isCompatible ? 100 : Math.max(0, 100 - issues.length * 25);

    const compatibility: UpgradeCompatibility = {
      currentAddress,
      newAddress,
      isCompatible,
      issues,
      compatibilityScore,
    };

    return NextResponse.json({
      success: true,
      ...compatibility,
      type: 'upgrade-compatibility',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check upgrade compatibility' },
      { status: 500 }
    );
  }
}


