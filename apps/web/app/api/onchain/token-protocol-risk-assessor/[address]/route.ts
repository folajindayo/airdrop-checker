import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const normalize = (value?: string | null) => (value || '').toLowerCase();
const toNumber = (value?: string | number | null): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

/**
 * GET /api/onchain/token-protocol-risk-assessor/[address]
 * Assess risk levels of protocols the wallet interacts with.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 300);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-protocol-risk:${normalizedAddress}:${chainId || '1'}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId, 10) : 1;
    const response = await goldrushClient.get<{
      data?: { items?: any[] };
    }>(`/v1/${targetChainId}/address/${normalizedAddress}/transactions_v3/`, {
      'page-size': limit,
    });

    const items = response?.data?.items || [];
    const protocolStats = new Map<string, {
      interactions: number;
      failedTxs: number;
      totalValueUsd: number;
      avgGasUsd: number;
    }>();

    items.forEach((tx: any) => {
      const protocol = tx.to_address_label || tx.to_address || 'unknown';
      if (!protocolStats.has(protocol)) {
        protocolStats.set(protocol, {
          interactions: 0,
          failedTxs: 0,
          totalValueUsd: 0,
          avgGasUsd: 0,
        });
      }
      const stats = protocolStats.get(protocol)!;
      stats.interactions += 1;
      if (!tx.successful) stats.failedTxs += 1;
      stats.totalValueUsd += toNumber(tx.value_quote);
      stats.avgGasUsd += toNumber(tx.gas_quote);
    });

    const riskAssessment = Array.from(protocolStats.entries())
      .map(([protocol, stats]) => {
        const failureRate = stats.interactions > 0
          ? (stats.failedTxs / stats.interactions) * 100
          : 0;
        const avgGas = stats.interactions > 0
          ? stats.avgGasUsd / stats.interactions
          : 0;

        let riskScore = 0;
        if (failureRate > 10) riskScore += 30;
        else if (failureRate > 5) riskScore += 15;
        if (avgGas > 50) riskScore += 20;
        else if (avgGas > 20) riskScore += 10;
        if (stats.interactions < 3) riskScore += 25;

        return {
          protocol,
          interactions: stats.interactions,
          failureRate: +failureRate.toFixed(2),
          avgGasUsd: +avgGas.toFixed(4),
          totalValueUsd: +stats.totalValueUsd.toFixed(2),
          riskScore: Math.min(100, riskScore),
          riskLevel: riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low',
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore);

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      protocolsAnalyzed: riskAssessment.length,
      highRiskProtocols: riskAssessment.filter((p) => p.riskLevel === 'high').length,
      protocols: riskAssessment,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Protocol risk assessor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to assess protocol risks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
