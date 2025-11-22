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

const dayKey = (timestamp: string) => {
  const dt = new Date(timestamp);
  return `${dt.getUTCFullYear()}-${dt.getUTCMonth()}-${dt.getUTCDate()}`;
};

/**
 * GET /api/onchain/token-wallet-activity-clustering/[address]
 * Cluster wallet activities into behavioral patterns.
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
    const cacheKey = `onchain-activity-clustering:${normalizedAddress}:${lookbackDays}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
    const chains = SUPPORTED_CHAINS.slice(0, 5);

    const allTxs: Array<{
      chainId: number;
      valueUsd: number;
      gasUsd: number;
      occurredAt: string;
      day: string;
    }> = [];

    for (const chain of chains) {
      try {
        const response = await goldrushClient.get<{
          data?: { items?: any[] };
        }>(`/v1/${chain.id}/address/${normalizedAddress}/transactions_v3/`, {
          'page-size': limit,
        });
        const items = response?.data?.items || [];
        items.forEach((tx) => {
          if (new Date(tx.block_signed_at).getTime() >= cutoff) {
            allTxs.push({
              chainId: chain.id,
              valueUsd: toNumber(tx.value_quote),
              gasUsd: toNumber(tx.gas_quote),
              occurredAt: tx.block_signed_at,
              day: dayKey(tx.block_signed_at),
            });
          }
        });
      } catch (error) {
        console.error(`Activity clustering failed on chain ${chain.id}:`, error);
      }
    }

    if (!allTxs.length) {
      const emptyPayload = {
        address: normalizedAddress,
        lookbackDays,
        clusters: [],
        timestamp: Date.now(),
      } as const;
      cache.set(cacheKey, emptyPayload, 60 * 1000);
      return NextResponse.json(emptyPayload);
    }

    const dayGroups = allTxs.reduce<Record<string, {
      count: number;
      totalValue: number;
      totalGas: number;
    }>>((acc, tx) => {
      acc[tx.day] = acc[tx.day] || { count: 0, totalValue: 0, totalGas: 0 };
      acc[tx.day].count += 1;
      acc[tx.day].totalValue += tx.valueUsd;
      acc[tx.day].totalGas += tx.gasUsd;
      return acc;
    }, {});

    const clusters = Object.entries(dayGroups)
      .map(([day, stats]) => ({
        day,
        transactionCount: stats.count,
        totalValueUsd: +stats.totalValue.toFixed(2),
        totalGasUsd: +stats.totalGas.toFixed(4),
        avgValuePerTx: +(stats.totalValue / stats.count).toFixed(2),
        intensity: stats.count > 10 ? 'high' : stats.count > 5 ? 'medium' : 'low',
      }))
      .sort((a, b) => b.transactionCount - a.transactionCount);

    const highIntensityDays = clusters.filter((c) => c.intensity === 'high').length;
    const avgDailyTxs = allTxs.length / Object.keys(dayGroups).length;

    const payload = {
      address: normalizedAddress,
      lookbackDays,
      totalTransactions: allTxs.length,
      activeDays: clusters.length,
      avgDailyTxs: +avgDailyTxs.toFixed(2),
      highIntensityDays,
      clusters: clusters.slice(0, 20),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Wallet activity clustering error:', error);
    return NextResponse.json(
      {
        error: 'Failed to cluster wallet activities',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
