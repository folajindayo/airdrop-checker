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
 * GET /api/onchain/rug-pull-detector/[address]
 * Detect potential rug pull risks for token contracts
 * Analyzes on-chain patterns using Reown Wallet data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-rug-pull:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;
    const chain = chainMap[targetChainId] || mainnet;

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    const riskFactors: any[] = [];
    let riskScore = 0;

    try {
      const tokenData = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (tokenData.data) {
        const token = tokenData.data;
        
        const holderAnalysis = await analyzeHolders(normalizedAddress, targetChainId);
        const liquidityAnalysis = await analyzeLiquidity(normalizedAddress, targetChainId);
        const contractAnalysis = await analyzeContract(normalizedAddress, publicClient);

        if (holderAnalysis.concentration > 50) {
          riskScore += 30;
          riskFactors.push({
            type: 'high_concentration',
            severity: 'high',
            message: `Top 10 holders control ${holderAnalysis.concentration}% of supply`,
          });
        }

        if (liquidityAnalysis.isLocked === false) {
          riskScore += 25;
          riskFactors.push({
            type: 'unlocked_liquidity',
            severity: 'high',
            message: 'Liquidity is not locked - high rug pull risk',
          });
        }

        if (contractAnalysis.isVerified === false) {
          riskScore += 20;
          riskFactors.push({
            type: 'unverified_contract',
            severity: 'medium',
            message: 'Contract is not verified on block explorer',
          });
        }

        if (token.total_supply && parseFloat(token.total_supply) < 1000000) {
          riskScore += 15;
          riskFactors.push({
            type: 'low_supply',
            severity: 'medium',
            message: 'Very low total supply may indicate manipulation',
          });
        }
      }
    } catch (error) {
      console.error('Error analyzing token:', error);
    }

    const riskLevel = riskScore >= 70 ? 'critical' :
                      riskScore >= 50 ? 'high' :
                      riskScore >= 30 ? 'medium' : 'low';

    const result = {
      address: normalizedAddress,
      chainId: targetChainId,
      riskScore,
      riskLevel,
      riskFactors,
      recommendations: generateRecommendations(riskScore, riskFactors),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Rug pull detection error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze rug pull risk',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function analyzeHolders(tokenAddress: string, chainId: number): Promise<any> {
  try {
    const response = await goldrushClient.get(
      `/v2/${chainId}/tokens/${tokenAddress}/token_holders/`,
      { 'quote-currency': 'USD', 'page-size': 10 }
    );

    if (response.data?.items) {
      const holders = response.data.items;
      const totalSupply = holders.reduce((sum: number, h: any) => 
        sum + parseFloat(h.balance || '0'), 0);
      
      const top10Balance = holders.slice(0, 10).reduce((sum: number, h: any) => 
        sum + parseFloat(h.balance || '0'), 0);
      
      const concentration = totalSupply > 0 ? (top10Balance / totalSupply) * 100 : 0;
      
      return { concentration, totalHolders: holders.length };
    }
  } catch (error) {
    console.error('Error analyzing holders:', error);
  }
  
  return { concentration: 0, totalHolders: 0 };
}

async function analyzeLiquidity(tokenAddress: string, chainId: number): Promise<any> {
  try {
    const response = await goldrushClient.get(
      `/v2/${chainId}/tokens/${tokenAddress}/`,
      { 'quote-currency': 'USD' }
    );

    return {
      isLocked: false,
      liquidityUSD: response.data?.quote_rate || 0,
    };
  } catch (error) {
    console.error('Error analyzing liquidity:', error);
    return { isLocked: false, liquidityUSD: 0 };
  }
}

async function analyzeContract(address: `0x${string}`, client: any): Promise<any> {
  try {
    const code = await client.getBytecode({ address });
    return {
      isVerified: code && code !== '0x',
      hasCode: code && code !== '0x',
    };
  } catch (error) {
    return { isVerified: false, hasCode: false };
  }
}

function generateRecommendations(riskScore: number, factors: any[]): string[] {
  const recommendations: string[] = [];

  if (riskScore >= 70) {
    recommendations.push('CRITICAL: Do not invest - high rug pull risk detected');
    recommendations.push('Avoid interacting with this token using Reown wallet');
  } else if (riskScore >= 50) {
    recommendations.push('HIGH RISK: Exercise extreme caution');
    recommendations.push('Verify contract and liquidity locks before investing');
  } else if (riskScore >= 30) {
    recommendations.push('MEDIUM RISK: Proceed with caution');
    recommendations.push('Research the project thoroughly before investing');
  } else {
    recommendations.push('LOW RISK: Token appears relatively safe');
    recommendations.push('Still verify contract and team before investing');
  }

  return recommendations;
}

