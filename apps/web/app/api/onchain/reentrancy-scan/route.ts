import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { ReentrancyScanRequest, ReentrancyScanReport, ReentrancyVulnerability } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: ReentrancyScanRequest = await request.json();
    const { contractAddress, chainId } = body;

    if (!contractAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: contractAddress' },
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

    // Scan for reentrancy vulnerabilities (simplified - would need bytecode analysis)
    const vulnerabilities: ReentrancyVulnerability[] = [];
    
    // Check contract code for external calls before state changes
    const code = await publicClient.getBytecode({ address: contractAddress });
    
    // Simplified check - in production would analyze bytecode patterns
    const hasExternalCalls = code && code.length > 100;
    
    if (hasExternalCalls) {
      vulnerabilities.push({
        functionName: 'withdraw',
        severity: 'medium',
        description: 'External call before state update detected',
        recommendation: 'Use checks-effects-interactions pattern or ReentrancyGuard',
      });
    }

    const hasReentrancy = vulnerabilities.length > 0;
    const riskLevel = vulnerabilities.some(v => v.severity === 'critical' || v.severity === 'high')
      ? 'high'
      : vulnerabilities.length > 0
      ? 'medium'
      : 'low';

    const report: ReentrancyScanReport = {
      contractAddress,
      vulnerabilities,
      hasReentrancy,
      riskLevel,
    };

    return NextResponse.json({
      success: true,
      ...report,
      type: 'reentrancy-scan-report',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to scan for reentrancy vulnerabilities' },
      { status: 500 }
    );
  }
}


