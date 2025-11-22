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

const hourOfDay = (timestamp: string) => new Date(timestamp).getUTCHours();
const dayOfWeek = (timestamp: string) => new Date(timestamp).getUTCDay();

/**
 * GET /api/onchain/token-transaction-timing-optimizer/[address]
 * Analyze transaction timing patterns and suggest optimal times.
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
    const cacheKey = `onchain-timing-optimizer:${normalizedAddress}:${chainId || '1'}:${limit}`;
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
    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);
    const gasByHour = new Array(24).fill(0).map(() => ({ total: 0, count: 0 }));

    items.forEach((tx: any) => {
      const hour = hourOfDay(tx.block_signed_at);
      const day = dayOfWeek(tx.block_signed_at);
      hourCounts[hour] += 1;
      dayCounts[day] += 1;
      gasByHour[hour].total += toNumber(tx.gas_quote);
      gasByHour[hour].count += 1;
    });

    const avgGasByHour = gasByHour.map((data, hour) => ({
      hour,
      avgGasUsd: data.count > 0 ? +(data.total / data.count).toFixed(4) : 0,
      transactions: data.count,
    }));

    const optimalHour = avgGasByHour
      .filter((h) => h.transactions > 0)
      .sort((a, b) => a.avgGasUsd - b.avgGasUsd)[0]?.hour ?? null;

    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    const peakDay = dayCounts.indexOf(Math.max(...dayCounts));

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalTransactions: items.length,
      peakHour,
      peakDay,
      optimalHour,
      hourDistribution: hourCounts.map((count, hour) => ({
        hour,
        transactions: count,
        percentage: items.length > 0 ? +((count / items.length) * 100).toFixed(2) : 0,
      })),
      avgGasByHour: avgGasByHour.filter((h) => h.transactions > 0),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Transaction timing optimizer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to optimize transaction timing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
