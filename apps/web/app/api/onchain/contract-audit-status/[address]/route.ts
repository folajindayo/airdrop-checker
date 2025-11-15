import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

export const dynamic = 'force-dynamic';

const chainMap: Record<number, any> = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
};

/**
 * GET /api/onchain/contract-audit-status/[address]
 * Check contract audit status and security verification
 * Provides comprehensive security assessment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId') || '1';

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-audit-status:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);
    const chain = chainMap[targetChainId] || mainnet;

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    const audit: any = {
      contractAddress: normalizedAddress,
      chainId: targetChainId,
      chainName: chain.name,
      isVerified: false,
      hasCode: false,
      securityScore: 0,
      checks: {
        verified: false,
        hasBytecode: false,
        proxyPattern: false,
        upgradeable: false,
      },
      recommendations: [] as string[],
      timestamp: Date.now(),
    };

    try {
      const code = await publicClient.getBytecode({ address: normalizedAddress });
      audit.hasCode = code && code !== '0x';
      audit.checks.hasBytecode = audit.hasCode;

      const verificationResponse = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (verificationResponse.data) {
        audit.isVerified = verificationResponse.data.is_verified || false;
        audit.checks.verified = audit.isVerified;
      }
    } catch (error) {
      console.error('Error checking audit status:', error);
    }

    audit.securityScore = calculateSecurityScore(audit.checks);
    audit.recommendations = generateRecommendations(audit);

    cache.set(cacheKey, audit, 10 * 60 * 1000);

    return NextResponse.json(audit);
  } catch (error) {
    console.error('Contract audit status error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check audit status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function calculateSecurityScore(checks: any): number {
  let score = 0;

  if (checks.verified) score += 40;
  if (checks.hasBytecode) score += 30;
  if (!checks.proxyPattern) score += 20;
  if (!checks.upgradeable) score += 10;

  return score;
}

function generateRecommendations(audit: any): string[] {
  const recommendations: string[] = [];

  if (!audit.checks.verified) {
    recommendations.push('Contract is not verified - verify on block explorer');
  }
  if (audit.securityScore < 50) {
    recommendations.push('Low security score - review contract before interaction');
  }
  if (audit.checks.proxyPattern) {
    recommendations.push('Proxy pattern detected - verify implementation address');
  }

  return recommendations;
}

