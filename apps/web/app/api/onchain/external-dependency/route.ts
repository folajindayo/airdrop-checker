import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { ExternalDependencyRequest, ExternalDependency } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: ExternalDependencyRequest = await request.json();
    const { contractAddress, chainId } = body;

    if (!contractAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: contractAddress' },
        { status: 400 }
      );
    }

    // Analyze external dependencies (simplified)
    const dependencies: ExternalDependency['dependencies'] = [
      {
        address: '0x0000000000000000000000000000000000000000' as Address,
        type: 'oracle',
        riskLevel: 'medium',
        description: 'Price oracle dependency',
      },
    ];

    const highRiskCount = dependencies.filter(d => d.riskLevel === 'high').length;
    const totalRisk: 'low' | 'medium' | 'high' = highRiskCount > 2 ? 'high' : highRiskCount > 0 ? 'medium' : 'low';

    const recommendations: string[] = [];
    if (totalRisk === 'high') {
      recommendations.push('High external dependency risk - consider reducing dependencies');
    }

    const dependency: ExternalDependency = {
      contractAddress,
      dependencies,
      totalRisk,
      recommendations,
    };

    return NextResponse.json({
      success: true,
      ...dependency,
      type: 'external-dependency',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze external dependencies' },
      { status: 500 }
    );
  }
}

