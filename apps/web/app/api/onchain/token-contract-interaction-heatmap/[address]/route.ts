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

const dayKey = (timestamp: string) => {
  const dt = new Date(timestamp);
  return `${dt.getUTCFullYear()}-${dt.getUTCMonth()}-${dt.getUTCDate()}`;
};

/**
 * GET /api/onchain/token-contract-interaction-heatmap/[address]
 * Generate a heatmap of smart contract interactions over time.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '90', 10), 365);
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 300);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-contract-heatmap:${normalizedAddress}:${chainId || '1'}:${lookbackDays}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId, 10) : 1;
    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;

    const response = await goldrushClient.get<{
      data?: { items?: any[] };
    }>(`/v1/${targetChainId}/address/${normalizedAddress}/transactions_v3/`, {
      'page-size': limit,
    });

    const items = (response?.data?.items || []).filter(
      (tx) => new Date(tx.block_signed_at).getTime() >= cutoff
    );

    const heatmap = new Map<string, number>();
    const contractStats = new Map<string, { count: number; totalValue: number }>();

    items.forEach((tx: any) => {
      const day = dayKey(tx.block_signed_at);
      heatmap.set(day, (heatmap.get(day) || 0) + 1);

      const contract = normalize(tx.to_address);
      if (contract !== normalizedAddress) {
        if (!contractStats.has(contract)) {
          contractStats.set(contract, { count: 0, totalValue: 0 });
        }
        const stats = contractStats.get(contract)!;
        stats.count += 1;
        stats.totalValue += toNumber(tx.value_quote);
      }
    });

    const heatmapData = Array.from(heatmap.entries())
      .map(([day, count]) => ({ day, interactions: count }))
      .sort((a, b) => a.day.localeCompare(b.day));

    const topContracts = Array.from(contractStats.entries())
      .map(([contract, stats]) => ({
        contract,
        interactions: stats.count,
        totalValueUsd: +stats.totalValue.toFixed(2),
      }))
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 15);

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      lookbackDays,
      totalInteractions: items.length,
      uniqueContracts: contractStats.size,
      heatmap: heatmapData,
      topContracts,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Contract interaction heatmap error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate interaction heatmap',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
