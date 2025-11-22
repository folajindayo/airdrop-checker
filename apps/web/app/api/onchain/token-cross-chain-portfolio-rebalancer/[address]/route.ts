import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress, SUPPORTED_CHAINS } from '@airdrop-finder/shared';
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
 * GET /api/onchain/token-cross-chain-portfolio-rebalancer/[address]
 * Analyze cross-chain portfolio distribution and suggest rebalancing.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '60', 10), 180);
    const limit = Math.min(parseInt(searchParams.get('limit') || '150', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-portfolio-rebalancer:${normalizedAddress}:${lookbackDays}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
    const chains = SUPPORTED_CHAINS.slice(0, 6);

    const chainDistribution = new Map<number, {
      inflowUsd: number;
      outflowUsd: number;
      transactions: number;
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
          const isIn = normalize(tx.to_address) === normalizedAddress;
          const isOut = normalize(tx.from_address) === normalizedAddress;
          const valueUsd = toNumber(tx.value_quote);

          if (!chainDistribution.has(chain.id)) {
            chainDistribution.set(chain.id, { inflowUsd: 0, outflowUsd: 0, transactions: 0 });
          }
          const stats = chainDistribution.get(chain.id)!;
          stats.transactions += 1;
          if (isIn) stats.inflowUsd += valueUsd;
          if (isOut) stats.outflowUsd += valueUsd;
        });
      } catch (error) {
        console.error(`Portfolio rebalancer failed on chain ${chain.id}:`, error);
      }
    }

    const distribution = Array.from(chainDistribution.entries())
      .map(([chainId, stats]) => {
        const netValue = stats.inflowUsd - stats.outflowUsd;
        return {
          chainId,
          chainName: chains.find((c) => c.id === chainId)?.name || `Chain ${chainId}`,
          netValueUsd: +netValue.toFixed(2),
          inflowUsd: +stats.inflowUsd.toFixed(2),
          outflowUsd: +stats.outflowUsd.toFixed(2),
          transactions: stats.transactions,
        };
      })
      .sort((a, b) => b.netValueUsd - a.netValueUsd);

    const totalValue = distribution.reduce((sum, d) => sum + Math.max(0, d.netValueUsd), 0);
    const distributionPercentages = distribution.map((d) => ({
      ...d,
      percentage: totalValue > 0 ? +((Math.max(0, d.netValueUsd) / totalValue) * 100).toFixed(2) : 0,
    }));

    const payload = {
      address: normalizedAddress,
      lookbackDays,
      chainsAnalyzed: distribution.length,
      totalPortfolioValueUsd: +totalValue.toFixed(2),
      distribution: distributionPercentages,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Cross-chain portfolio rebalancer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze portfolio rebalancing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
