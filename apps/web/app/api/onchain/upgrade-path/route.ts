import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { UpgradePathRequest, UpgradePath } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: UpgradePathRequest = await request.json();
    const { proxyAddress, chainId } = body;

    if (!proxyAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: proxyAddress' },
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

    // Get implementation address
    let currentImplementation: Address = proxyAddress;
    try {
      const implSlot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
      const implData = await publicClient.getStorageAt({
        address: proxyAddress,
        slot: implSlot,
      });
      if (implData && implData !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        currentImplementation = `0x${implData.slice(-40)}` as Address;
      }
    } catch {
      // Not a proxy
    }

    const upgradeHistory: UpgradePath['upgradeHistory'] = [];
    const upgradeFrequency = upgradeHistory.length;
    const riskAssessment = upgradeFrequency > 5 ? 'high' : upgradeFrequency > 2 ? 'medium' : 'low';

    const path: UpgradePath = {
      proxyAddress,
      currentImplementation,
      upgradeHistory,
      upgradeFrequency,
      riskAssessment,
    };

    return NextResponse.json({
      success: true,
      ...path,
      type: 'upgrade-path',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze upgrade path' },
      { status: 500 }
    );
  }
}

