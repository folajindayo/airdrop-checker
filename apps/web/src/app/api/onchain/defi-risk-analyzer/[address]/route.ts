import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/defi-risk-analyzer/[address]
 * Analyze DeFi protocol risks for wallet interactions
 * Uses Reown Wallet data for comprehensive risk assessment
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

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-defi-risk:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChains = chainId
      ? SUPPORTED_CHAINS.filter((c) => c.id === parseInt(chainId))
      : SUPPORTED_CHAINS;

    const protocols: Record<string, any> = {};
    const risks: any[] = [];
    let totalExposure = 0;

    for (const chain of targetChains) {
      try {
        const response = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/balances_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'nft': 'false',
          }
        );

        if (response.data?.items) {
          const items = response.data.items;

          items.forEach((token: any) => {
            const protocol = detectProtocol(token.contract_name, token.contract_ticker_symbol);
            
            if (protocol !== 'Unknown' && token.quote > 0) {
              if (!protocols[protocol]) {
                protocols[protocol] = {
                  name: protocol,
                  totalValue: 0,
                  positions: [],
                  riskScore: 0,
                };
              }

              protocols[protocol].totalValue += token.quote;
              protocols[protocol].positions.push({
                chainId: chain.id,
                chainName: chain.name,
                tokenAddress: token.contract_address,
                tokenSymbol: token.contract_ticker_symbol,
                valueUSD: token.quote,
              });

              totalExposure += token.quote;
            }
          });
        }
      } catch (error) {
        console.error(`Error analyzing DeFi risk on ${chain.name}:`, error);
      }
    }

    Object.values(protocols).forEach((protocol: any) => {
      protocol.riskScore = calculateProtocolRisk(protocol.name);
      
      if (protocol.riskScore >= 70) {
        risks.push({
          protocol: protocol.name,
          severity: 'high',
          message: `High risk exposure to ${protocol.name}`,
          valueUSD: protocol.totalValue,
        });
      }
    });

    const overallRisk = calculateOverallRisk(protocols, totalExposure);

    const result = {
      address: normalizedAddress,
      totalExposureUSD: totalExposure,
      overallRiskScore: overallRisk.score,
      overallRiskLevel: overallRisk.level,
      protocols: Object.values(protocols),
      risks,
      recommendations: generateRiskRecommendations(overallRisk, protocols),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('DeFi risk analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze DeFi risks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function detectProtocol(contractName?: string, symbol?: string): string {
  const name = (contractName || '').toLowerCase();
  const sym = (symbol || '').toLowerCase();

  if (name.includes('uniswap') || sym.includes('uni')) return 'Uniswap';
  if (name.includes('aave') || sym.includes('aave')) return 'Aave';
  if (name.includes('compound') || sym.includes('comp')) return 'Compound';
  if (name.includes('maker') || sym.includes('dai')) return 'MakerDAO';
  if (name.includes('curve') || sym.includes('crv')) return 'Curve';
  if (name.includes('balancer') || sym.includes('bal')) return 'Balancer';
  if (name.includes('yearn') || sym.includes('yfi')) return 'Yearn';
  if (name.includes('convex') || sym.includes('cvx')) return 'Convex';

  return 'Unknown';
}

function calculateProtocolRisk(protocolName: string): number {
  const riskScores: Record<string, number> = {
    'Uniswap': 20,
    'Aave': 30,
    'Compound': 25,
    'MakerDAO': 15,
    'Curve': 25,
    'Balancer': 30,
    'Yearn': 40,
    'Convex': 35,
  };

  return riskScores[protocolName] || 50;
}

function calculateOverallRisk(protocols: Record<string, any>, totalExposure: number): any {
  if (totalExposure === 0) {
    return { score: 0, level: 'none' };
  }

  const weightedRisk = Object.values(protocols).reduce((sum: number, protocol: any) => {
    const weight = protocol.totalValue / totalExposure;
    return sum + (protocol.riskScore * weight);
  }, 0);

  const score = Math.round(weightedRisk);
  const level = score >= 70 ? 'high' : score >= 50 ? 'medium' : score >= 30 ? 'low' : 'minimal';

  return { score, level };
}

function generateRiskRecommendations(overallRisk: any, protocols: Record<string, any>): string[] {
  const recommendations: string[] = [];

  if (overallRisk.level === 'high') {
    recommendations.push('Consider diversifying across lower-risk protocols');
    recommendations.push('Monitor positions regularly using Reown wallet');
    recommendations.push('Set up alerts for significant value changes');
  } else if (overallRisk.level === 'medium') {
    recommendations.push('Monitor protocol health and TVL trends');
    recommendations.push('Consider rebalancing if risk increases');
  } else {
    recommendations.push('Risk level is acceptable');
    recommendations.push('Continue monitoring protocol developments');
  }

  const highRiskProtocols = Object.values(protocols).filter((p: any) => p.riskScore >= 70);
  if (highRiskProtocols.length > 0) {
    recommendations.push(`Review positions in: ${highRiskProtocols.map((p: any) => p.name).join(', ')}`);
  }

  return recommendations;
}

