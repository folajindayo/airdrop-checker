import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const INTENT_HINTS = [
  'intent',
  'solver',
  'cow',
  'relay',
  'aggregator',
  'paymaster',
  'protect',
];

const normalize = (value?: string | null) => (value || '').toLowerCase();
const toNumber = (value?: string | number | null) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const looksLikeIntent = (tx: any) => {
  const blob = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)} ${
    tx.log_events?.map((log: any) => normalize(log.sender_name)).join(' ') || ''
  }`;
  return INTENT_HINTS.some((hint) => blob.includes(hint));
};

/**
 * GET /api/onchain/token-intent-solver-fee-report/[address]
 * Aggregate solver fees and latency for intent-style transactions.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '160', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-intent-solver-fee-report:${normalizedAddress}:${chainId || '1'}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId, 10) : 1;
    const response = await goldrushClient.get<{
      data?: { items?: any[] };
    }>(`/v1/${targetChainId}/address/${normalizedAddress}/transactions_v3/`, {
      'page-size': limit,
      'with-logs': true,
    });

    const items = (response?.data?.items || []).filter(looksLikeIntent);
    if (!items.length) {
      const emptyPayload = {
        address: normalizedAddress,
        chainId: targetChainId,
        inspected: 0,
        solvers: [],
        totals: {
          feesUsd: 0,
          gasUsd: 0,
        },
        timestamp: Date.now(),
      } as const;
      cache.set(cacheKey, emptyPayload, 60 * 1000);
      return NextResponse.json(emptyPayload);
    }

    const solverStats = items.reduce<Record<string, {
      count: number;
      feeUsd: number;
      gasUsd: number;
      lastSeen: string;
    }>>((acc, tx) => {
      const solver = tx.to_address_label || tx.to_address || 'unknown';
      acc[solver] = acc[solver] || { count: 0, feeUsd: 0, gasUsd: 0, lastSeen: tx.block_signed_at };
      acc[solver].count += 1;
      acc[solver].feeUsd += toNumber(tx.value_quote);
      acc[solver].gasUsd += toNumber(tx.gas_quote);
      if (new Date(tx.block_signed_at).getTime() > new Date(acc[solver].lastSeen).getTime()) {
        acc[solver].lastSeen = tx.block_signed_at;
      }
      return acc;
    }, {});

    const solvers = Object.entries(solverStats)
      .map(([solver, stats]) => ({
        solver,
        fills: stats.count,
        feeUsd: +stats.feeUsd.toFixed(4),
        avgFeeUsd: +(stats.feeUsd / stats.count).toFixed(4),
        avgGasUsd: +(stats.gasUsd / stats.count).toFixed(4),
        lastSeen: stats.lastSeen,
      }))
      .sort((a, b) => b.fills - a.fills)
      .slice(0, 12);

    const totals = solvers.reduce(
      (acc, solver) => {
        acc.feesUsd += solver.feeUsd;
        acc.gasUsd += solver.avgGasUsd * solver.fills;
        return acc;
      },
      { feesUsd: 0, gasUsd: 0 }
    );

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      inspected: items.length,
      solvers,
      totals: {
        feesUsd: +totals.feesUsd.toFixed(4),
        gasUsd: +totals.gasUsd.toFixed(4),
      },
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Intent solver fee report error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze solver fees',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
