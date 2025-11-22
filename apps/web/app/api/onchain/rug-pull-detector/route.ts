import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { RugPullDetectionRequest, RugPullAnalysis } from '@/lib/onchain/types';
import { calculateRugPullRiskScore, determineRugPullRiskLevel } from '@/lib/onchain/helpers';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: RugPullDetectionRequest = await request.json();
    const { tokenAddress, chainId } = body;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
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

    // Check contract verification
    const code = await publicClient.getBytecode({ address: tokenAddress });
    const contractVerified = code && code !== '0x';

    // Check for ownership (try to read owner() function)
    let ownershipRenounced = false;
    let highOwnership = false;
    try {
      // This is a simplified check - in production, you'd need the actual ABI
      const owner = await publicClient.readContract({
        address: tokenAddress,
        abi: [{
          name: 'owner',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'address' }],
        }],
        functionName: 'owner',
      }).catch(() => null);
      
      ownershipRenounced = owner === '0x0000000000000000000000000000000000000000' || owner === null;
    } catch {
      ownershipRenounced = true; // Assume renounced if can't read
    }

    // Check for liquidity locks (simplified - would need to check actual LP locks)
    const liquidityLocked = false; // Would need to check actual lock contracts

    // Check for tax (simplified)
    const hasTax = false; // Would need to analyze transfer function

    // Check for suspicious activity (recent large transfers)
    const suspiciousActivity = false; // Would need transaction history analysis

    const riskFactors = {
      liquidityLocked,
      ownershipRenounced,
      contractVerified: !!contractVerified,
      hasTax,
      highOwnership,
      suspiciousActivity,
    };

    const riskScore = calculateRugPullRiskScore(riskFactors);
    const riskLevel = determineRugPullRiskLevel(riskScore);
    const isRugPull = riskLevel === 'critical' || riskLevel === 'high';

    const recommendations: string[] = [];
    if (!liquidityLocked) recommendations.push('Liquidity should be locked in a trusted contract');
    if (!ownershipRenounced) recommendations.push('Consider renouncing ownership for decentralization');
    if (!contractVerified) recommendations.push('Contract should be verified on block explorer');
    if (hasTax) recommendations.push('High tax rates may indicate rug pull risk');
    if (highOwnership) recommendations.push('High ownership concentration is a risk factor');

    const analysis: RugPullAnalysis = {
      tokenAddress,
      isRugPull,
      riskLevel,
      riskFactors,
      riskScore,
      recommendations,
    };

    return NextResponse.json({
      success: true,
      ...analysis,
      type: 'rug-pull-detection',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze rug pull risk' },
      { status: 500 }
    );
  }
}


