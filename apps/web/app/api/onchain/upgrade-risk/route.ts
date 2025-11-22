import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { UpgradeRiskRequest, UpgradeRiskAnalysis } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: UpgradeRiskRequest = await request.json();
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

    // Check for implementation address (proxy pattern)
    let implementationAddress: Address | undefined;
    try {
      const implSlot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
      const implData = await publicClient.getStorageAt({
        address: proxyAddress,
        slot: implSlot,
      });
      if (implData && implData !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        implementationAddress = `0x${implData.slice(-40)}` as Address;
      }
    } catch {
      // Not a standard proxy
    }

    // Check for admin address
    let adminAddress: Address | undefined;
    try {
      const adminSlot = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';
      const adminData = await publicClient.getStorageAt({
        address: proxyAddress,
        slot: adminSlot,
      });
      if (adminData && adminData !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        adminAddress = `0x${implData?.slice(-40) || '0'}` as Address;
      }
    } catch {
      // Admin not found
    }

    // Analyze upgrade risks
    const hasTimelock = false; // Would need to check for timelock contract
    const hasMultisig = adminAddress ? true : false; // Simplified check
    const upgradeFrequency = 0; // Would need historical upgrade data
    const lastUpgrade = 0; // Would need historical upgrade data

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (!hasTimelock && !hasMultisig) riskLevel = 'high';
    else if (!hasTimelock || !hasMultisig) riskLevel = 'medium';

    const recommendations: string[] = [];
    if (!hasTimelock) recommendations.push('Implement timelock for upgrade delays');
    if (!hasMultisig) recommendations.push('Use multisig for upgrade authorization');
    if (upgradeFrequency > 5) recommendations.push('High upgrade frequency may indicate instability');

    const analysis: UpgradeRiskAnalysis = {
      proxyAddress,
      implementationAddress: implementationAddress || proxyAddress,
      riskLevel,
      risks: {
        hasTimelock,
        hasMultisig,
        upgradeFrequency,
        lastUpgrade,
      },
      recommendations,
    };

    return NextResponse.json({
      success: true,
      ...analysis,
      type: 'upgrade-risk-analysis',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze upgrade risk' },
      { status: 500 }
    );
  }
}


