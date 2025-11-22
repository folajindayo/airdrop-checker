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
 * GET /api/onchain/token-airdrop-farming-pattern/[address]
 * Detect airdrop farming patterns from transaction timing and protocol interactions.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '60', 10), 180);
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 300);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-airdrop-farming-pattern:${normalizedAddress}:${lookbackDays}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
    const chains = SUPPORTED_CHAINS.slice(0, 5);

    const allTxs: Array<{
      chainId: number;
      occurredAt: string;
      valueUsd: number;
      gasUsd: number;
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
              occurredAt: tx.block_signed_at,
              valueUsd: toNumber(tx.value_quote),
              gasUsd: toNumber(tx.gas_quote),
            });
          }
        });
      } catch (error) {
        console.error(`Farming pattern fetch failed on chain ${chain.id}:`, error);
      }
    }

    if (!allTxs.length) {
      const emptyPayload = {
        address: normalizedAddress,
        lookbackDays,
        farmingScore: 0,
        patterns: [],
        timestamp: Date.now(),
      } as const;
      cache.set(cacheKey, emptyPayload, 60 * 1000);
      return NextResponse.json(emptyPayload);
    }

    allTxs.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

    const dayGroups = allTxs.reduce<Record<string, number>>((acc, tx) => {
      const key = dayKey(tx.occurredAt);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const avgTxsPerDay = Object.values(dayGroups).reduce((sum, count) => sum + count, 0) / Object.keys(dayGroups).length;
    const burstDays = Object.values(dayGroups).filter((count) => count > avgTxsPerDay * 2).length;
    const chainDiversity = new Set(allTxs.map((tx) => tx.chainId)).size;
    const lowValueHighGas = allTxs.filter((tx) => tx.valueUsd < 10 && tx.gasUsd > 5).length;

    let farmingScore = 0;
    const patterns: Array<{ pattern: string; score: number }> = [];

    if (burstDays > 5) {
      const score = Math.min(30, burstDays * 3);
      farmingScore += score;
      patterns.push({ pattern: 'burst-activity', score });
    }

    if (chainDiversity >= 4) {
      const score = Math.min(25, chainDiversity * 5);
      farmingScore += score;
      patterns.push({ pattern: 'multi-chain-spread', score });
    }

    if (lowValueHighGas > allTxs.length * 0.3) {
      const score = Math.min(25, (lowValueHighGas / allTxs.length) * 50);
      farmingScore += score;
      patterns.push({ pattern: 'low-value-high-gas', score });
    }

    const avgDailyTxs = avgTxsPerDay;
    if (avgDailyTxs > 10) {
      const score = Math.min(20, (avgDailyTxs - 10) * 2);
      farmingScore += score;
      patterns.push({ pattern: 'high-frequency', score });
    }

    farmingScore = Math.min(100, farmingScore);

    const payload = {
      address: normalizedAddress,
      lookbackDays,
      totalTransactions: allTxs.length,
      uniqueChains: chainDiversity,
      avgTxsPerDay: +avgDailyTxs.toFixed(2),
      burstDays,
      farmingScore: +farmingScore.toFixed(2),
      patterns: patterns.sort((a, b) => b.score - a.score),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Airdrop farming pattern error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect farming patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
