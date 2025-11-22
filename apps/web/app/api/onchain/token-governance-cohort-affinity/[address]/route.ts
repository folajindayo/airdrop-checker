import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const GOVERNANCE_HINTS = ['vote', 'proposal', 'delegate', 'tally', 'snapshot'];

const normalize = (value?: string | null) => (value || '').toLowerCase();
const toNumber = (value?: string | number | null): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const looksGovernance = (tx: any) => {
  const blob = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)} ${
    tx.log_events?.map((log: any) => normalize(log.sender_name)).join(' ') || ''
  }`;
  return GOVERNANCE_HINTS.some((hint) => blob.includes(hint));
};

const dayKey = (timestamp: string) => {
  const dt = new Date(timestamp);
  return `${dt.getUTCFullYear()}-${dt.getUTCMonth()}-${dt.getUTCDate()}`;
};

/**
 * GET /api/onchain/token-governance-cohort-affinity/[address]
 * Build an affinity map between DAOs/cohorts interacted with by the wallet.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '120', 10), 365);
    const limit = Math.min(parseInt(searchParams.get('limit') || '160', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-governance-cohort-affinity:${normalizedAddress}:${lookbackDays}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;

    const response = await goldrushClient.get<{
      data?: { items?: any[] };
    }>(`/v1/1/address/${normalizedAddress}/transactions_v3/`, {
      'page-size': limit,
      'with-logs': true,
    });

    const items = (response?.data?.items || []).filter(
      (tx) => new Date(tx.block_signed_at).getTime() >= cutoff && looksGovernance(tx)
    );

    if (!items.length) {
      const emptyPayload = {
        address: normalizedAddress,
        lookbackDays,
        cohorts: [],
        edges: [],
        summary: {
          totalInteractions: 0,
          strongestCohort: null,
        },
        recentInteractions: [],
        timestamp: Date.now(),
      } as const;
      cache.set(cacheKey, emptyPayload, 60 * 1000);
      return NextResponse.json(emptyPayload);
    }

    const cohortStats = items.reduce<Record<string, {
      count: number;
      lastSeen: string;
      votingPowerUsd: number;
    }>>((acc, tx) => {
      const cohort = tx.to_address_label || tx.to_address || 'unknown';
      acc[cohort] = acc[cohort] || { count: 0, lastSeen: tx.block_signed_at, votingPowerUsd: 0 };
      acc[cohort].count += 1;
      acc[cohort].votingPowerUsd += toNumber(tx.value_quote);
      if (new Date(tx.block_signed_at).getTime() > new Date(acc[cohort].lastSeen).getTime()) {
        acc[cohort].lastSeen = tx.block_signed_at;
      }
      return acc;
    }, {});

    const cohorts = Object.entries(cohortStats)
      .map(([cohort, stats]) => ({
        cohort,
        interactions: stats.count,
        strength: +(stats.count / items.length).toFixed(3),
        votingPowerUsd: +stats.votingPowerUsd.toFixed(2),
        lastSeen: stats.lastSeen,
      }))
      .sort((a, b) => b.interactions - a.interactions);

    const groupedByDay = items.reduce<Record<string, Set<string>>>((acc, tx) => {
      const key = dayKey(tx.block_signed_at);
      acc[key] = acc[key] || new Set<string>();
      acc[key].add(tx.to_address_label || tx.to_address || 'unknown');
      return acc;
    }, {});

    const edgeWeights = new Map<string, number>();
    Object.values(groupedByDay).forEach((cohortSet) => {
      const list = Array.from(cohortSet);
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const key = `${list[i]}::${list[j]}`;
          edgeWeights.set(key, (edgeWeights.get(key) || 0) + 1);
        }
      }
    });

    const edges = Array.from(edgeWeights.entries())
      .map(([key, weight]) => {
        const [source, target] = key.split('::');
        return { source, target, weight };
      })
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 20);

    const recentInteractions = items
      .sort((a, b) => new Date(b.block_signed_at).getTime() - new Date(a.block_signed_at).getTime())
      .slice(0, 12)
      .map((tx) => ({
        txHash: tx.tx_hash,
        cohort: tx.to_address_label || tx.to_address || 'unknown',
        occurredAt: tx.block_signed_at,
        valueUsd: +toNumber(tx.value_quote).toFixed(2),
      }));

    const strongestCohort = cohorts[0]?.cohort || null;

    const payload = {
      address: normalizedAddress,
      lookbackDays,
      cohorts,
      edges,
      summary: {
        totalInteractions: items.length,
        strongestCohort,
      },
      recentInteractions,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
