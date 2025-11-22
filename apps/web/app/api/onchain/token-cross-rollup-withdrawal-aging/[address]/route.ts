import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const ROLLUP_CONFIG = [
  {
    name: 'Optimism',
    l2ChainId: 10,
    withdrawHints: ['withdraw', 'optimism bridge', 'optimism portal', 'l2->l1'],
    finalizerHints: ['optimism gateway', 'optimistic bridge'],
  },
  {
    name: 'Arbitrum One',
    l2ChainId: 42161,
    withdrawHints: ['withdraw', 'arbitrum bridge', 'arb retryable'],
    finalizerHints: ['arbitrum bridge', 'arb one'],
  },
  {
    name: 'Base',
    l2ChainId: 8453,
    withdrawHints: ['withdraw', 'base bridge'],
    finalizerHints: ['base bridge', 'base portal'],
  },
] as const;

const normalize = (value?: string | null) => (value || '').toLowerCase();

const toNumber = (value?: string | number | null): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const withinLookback = (timestamp: string, cutoff: number) =>
  new Date(timestamp).getTime() >= cutoff;

const labelMatches = (hints: string[], ...labels: (string | null | undefined)[]) => {
  const blob = labels.map((label) => normalize(label)).join(' ');
  return hints.some((hint) => blob.includes(hint));
};

const findMatch = (
  withdrawal: { valueUsd: number; initiatedAt: string },
  candidates: Array<{ valueUsd: number; finalizedAt: string }>
) => {
  const withdrawTime = new Date(withdrawal.initiatedAt).getTime();
  let matchIndex = -1;
  let minDelta = Number.POSITIVE_INFINITY;

  candidates.forEach((candidate, index) => {
    const finalizeTime = new Date(candidate.finalizedAt).getTime();
    if (finalizeTime < withdrawTime) {
      return;
    }
    const valueRatio = withdrawal.valueUsd > 0
      ? Math.abs(candidate.valueUsd - withdrawal.valueUsd) / withdrawal.valueUsd
      : 0;
    if (valueRatio > 0.15) {
      return;
    }
    const delta = finalizeTime - withdrawTime;
    if (delta < minDelta) {
      minDelta = delta;
      matchIndex = index;
    }
  });

  if (matchIndex === -1) {
    return null;
  }

  const [match] = candidates.splice(matchIndex, 1);
  return match;
};

/**
 * GET /api/onchain/token-cross-rollup-withdrawal-aging/[address]
 * Track withdrawal latency across Optimism/Base/Arbitrum exits.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '60', 10), 180);
    const l2Only = searchParams.get('chainId');
    const pageSize = Math.min(parseInt(searchParams.get('limit') || '140', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-cross-rollup-withdrawal-aging:${normalizedAddress}:${
      l2Only || 'multi'
    }:${lookbackDays}:${pageSize}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;

    // Fetch inbound finalizations on Ethereum mainnet once
    const ethResponse = await goldrushClient.get<{
      data?: { items?: any[] };
    }>(`/v1/1/address/${normalizedAddress}/transactions_v3/`, {
      'page-size': pageSize,
      'with-logs': true,
    });
    const ethTxs = ethResponse?.data?.items || [];

    const finalizationBuckets = ROLLUP_CONFIG.reduce<Record<string, Array<{ valueUsd: number; finalizedAt: string }>>>(
      (acc, config) => {
        acc[config.name] = [];
        return acc;
      },
      {}
    );

    ethTxs.forEach((tx) => {
      if (!withinLookback(tx.block_signed_at, cutoff)) {
        return;
      }
      ROLLUP_CONFIG.forEach((config) => {
        if (
          labelMatches(config.finalizerHints, tx.to_address_label, tx.from_address_label) &&
          normalize(tx.to_address) === normalizedAddress
        ) {
          finalizationBuckets[config.name].push({
            valueUsd: toNumber(tx.value_quote),
            finalizedAt: tx.block_signed_at,
          });
        }
      });
    });

    const configsToInspect = l2Only
      ? ROLLUP_CONFIG.filter((config) => config.l2ChainId === parseInt(l2Only, 10))
      : ROLLUP_CONFIG;

    const chainInsights = [] as Array<{
      chainId: number;
      rollup: string;
      withdrawals: number;
      pending: number;
      avgFinalizedMinutes: number | null;
      longestPendingMinutes: number | null;
      recentWithdrawals: Array<{
        txHash: string;
        initiatedAt: string;
        valueUsd: number;
        status: 'pending' | 'finalized';
        waitMinutes: number;
      }>;
    }>;

    for (const config of configsToInspect) {
      const response = await goldrushClient.get<{
        data?: { items?: any[] };
      }>(`/v1/${config.l2ChainId}/address/${normalizedAddress}/transactions_v3/`, {
        'page-size': pageSize,
        'with-logs': true,
      });

      const l2Txs = response?.data?.items || [];
      const withdrawals: Array<{
        txHash: string;
        initiatedAt: string;
        valueUsd: number;
        status: 'pending' | 'finalized';
        waitMinutes: number;
      }> = [];

      const candidateFinalizations = finalizationBuckets[config.name];

      l2Txs.forEach((tx) => {
        if (!withinLookback(tx.block_signed_at, cutoff)) {
          return;
        }
        const fromWallet = normalize(tx.from_address) === normalizedAddress;
        if (!fromWallet) {
          return;
        }
        if (
          !labelMatches(
            config.withdrawHints,
            tx.to_address_label,
            tx.from_address_label,
            tx.log_events?.[0]?.sender_name
          )
        ) {
          return;
        }

        const valueUsd = toNumber(tx.value_quote);
        const match = findMatch(
          { valueUsd, initiatedAt: tx.block_signed_at },
          candidateFinalizations
        );

        if (match) {
          const waitMinutes =
            (new Date(match.finalizedAt).getTime() - new Date(tx.block_signed_at).getTime()) /
            (1000 * 60);
          withdrawals.push({
            txHash: tx.tx_hash,
            initiatedAt: tx.block_signed_at,
            valueUsd: +valueUsd.toFixed(2),
            status: 'finalized',
            waitMinutes: +waitMinutes.toFixed(2),
          });
        } else {
          const pendingMinutes =
            (Date.now() - new Date(tx.block_signed_at).getTime()) / (1000 * 60);
          withdrawals.push({
            txHash: tx.tx_hash,
            initiatedAt: tx.block_signed_at,
            valueUsd: +valueUsd.toFixed(2),
            status: 'pending',
            waitMinutes: +pendingMinutes.toFixed(2),
          });
        }
      });

      if (!withdrawals.length) {
        continue;
      }

      const finalized = withdrawals.filter((event) => event.status === 'finalized');
      const pending = withdrawals.filter((event) => event.status === 'pending');
      const avgFinalizedMinutes = finalized.length
        ? finalized.reduce((sum, event) => sum + event.waitMinutes, 0) / finalized.length
        : null;
      const longestPending = pending.length
        ? Math.max(...pending.map((event) => event.waitMinutes))
        : null;

      chainInsights.push({
        chainId: config.l2ChainId,
        rollup: config.name,
        withdrawals: withdrawals.length,
        pending: pending.length,
        avgFinalizedMinutes: avgFinalizedMinutes
          ? +avgFinalizedMinutes.toFixed(2)
          : null,
        longestPendingMinutes: longestPending ? +longestPending.toFixed(2) : null,
        recentWithdrawals: withdrawals
          .sort((a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime())
          .slice(0, 12),
      });
    }

    const totalPending = chainInsights.reduce((sum, chain) => sum + chain.pending, 0);
    const totalWithdrawals = chainInsights.reduce((sum, chain) => sum + chain.withdrawals, 0);

    const responsePayload = {
      address: normalizedAddress,
      lookbackDays,
      rollupsCovered: chainInsights.length,
      totalWithdrawals,
      totalPending,
      chains: chainInsights,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, responsePayload, 60 * 1000);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Cross-rollup withdrawal aging error:', error);
    return NextResponse.json(
      {
        error: 'Failed to compute withdrawal aging metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
