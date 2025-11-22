import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress, SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const DEFI_PROTOCOLS = ['aave', 'compound', 'maker', 'morpho', 'spark', 'ajna'];
const normalize = (v?: string | null) => (v || '').toLowerCase();
const toNumber = (v?: string | number | null): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const p = Number(v);
    return Number.isFinite(p) ? p : 0;
  }
  return 0;
};

const detectDeFiProtocol = (tx: any): string | null => {
  const blob = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)}`;
  for (const protocol of DEFI_PROTOCOLS) {
    if (blob.includes(protocol)) {
      return protocol;
    }
  }
  return null;
};

/**
 * GET /api/onchain/token-defi-position-health/[address]
 * Monitor health of DeFi positions and liquidation risks.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '90', 10), 365);
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 300);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-defi-health:${normalizedAddress}:${lookbackDays}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
    const chains = SUPPORTED_CHAINS.slice(0, 5);
    const protocolStats = new Map<string, {
      interactions: number;
      totalValueUsd: number;
      failedTxs: number;
    }>();

    for (const chain of chains) {
      try {
        const response = await goldrushClient.get<{
          data?: { items?: any[] };
        }>(`/v1/${chain.id}/address/${normalizedAddress}/transactions_v3/`, {
          'page-size': limit,
        });
        const items = response?.data?.items || [];
        items.forEach((tx) => {
          if (new Date(tx.block_signed_at).getTime() < cutoff) return;
          const protocol = detectDeFiProtocol(tx);
          if (protocol) {
            if (!protocolStats.has(protocol)) {
              protocolStats.set(protocol, { interactions: 0, totalValueUsd: 0, failedTxs: 0 });
            }
            const stats = protocolStats.get(protocol)!;
            stats.interactions += 1;
            stats.totalValueUsd += toNumber(tx.value_quote);
            if (!tx.successful) stats.failedTxs += 1;
          }
        });
      } catch (error) {
        console.error(`DeFi health check failed on chain ${chain.id}:`, error);
    // Enhanced error logging for debugging
      }
    }

    const positions = Array.from(protocolStats.entries())
      .map(([protocol, stats]) => {
        const healthScore = stats.interactions > 0
          ? Math.max(0, 100 - (stats.failedTxs / stats.interactions) * 100)
          : 100;
        return {
          protocol,
          interactions: stats.interactions,
          totalValueUsd: +stats.totalValueUsd.toFixed(2),
          healthScore: +healthScore.toFixed(2),
          riskLevel: healthScore < 50 ? 'high' : healthScore < 80 ? 'medium' : 'low',
        };
      })
      .sort((a, b) => a.healthScore - b.healthScore);

    const payload = {
      address: normalizedAddress,
      lookbackDays,
      totalPositions: positions.length,
      positions,
      avgHealthScore: positions.length
        ? +(positions.reduce((sum, p) => sum + p.healthScore, 0) / positions.length).toFixed(2)
        : 100,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('DeFi position health error:', error);
    // Enhanced error logging for debugging
    return NextResponse.json(
      {
        error: 'Failed to analyze DeFi position health',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
