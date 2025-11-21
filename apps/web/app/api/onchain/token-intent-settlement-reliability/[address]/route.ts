import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const INTENT_HINTS = [
  'intent',
  'solver',
  'cow',
  'relayer',
  'paymaster',
  'gelato',
  'flashbot',
  'mev',
  'router',
  'meta tx',
  'metatx',
  'account abstraction',
  'aggregator',
];

type GoldrushTransaction = {
  tx_hash: string;
  block_signed_at: string;
  block_height: number;
  successful: boolean;
  from_address: string;
  to_address: string;
  to_address_label?: string | null;
  value_quote?: number;
  fees_paid_quote?: number;
  gas_spent?: number;
  gas_price?: string | number;
  log_events?: Array<{
    decoded?: { name?: string | null };
    sender_name?: string | null;
    raw_log_topic0?: string | null;
    raw_log_data?: string | null;
  }>;
};

const looksLikeIntent = (tx: GoldrushTransaction): boolean => {
  const label = tx.to_address_label?.toLowerCase() || '';
  const hasIntentLabel = INTENT_HINTS.some((hint) => label.includes(hint));
  if (hasIntentLabel) {
    return true;
  }

  const logSignals =
    tx.log_events?.some((evt) => {
      const name = evt.decoded?.name?.toLowerCase() || '';
      const senderName = evt.sender_name?.toLowerCase() || '';
      const raw = `${evt.raw_log_topic0 || ''}${evt.raw_log_data || ''}`.toLowerCase();
      return INTENT_HINTS.some(
        (hint) => name.includes(hint) || senderName.includes(hint) || raw.includes(hint)
      );
    }) ?? false;

  if (logSignals) {
    return true;
  }

  // Many intents settle with near-zero value transfers (meta-transactions)
  const lowValue = (tx.value_quote || 0) < 5 && (tx.fees_paid_quote || 0) > 0;

  return lowValue;
};

const average = (values: number[]): number => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const toGwei = (value: string | number | undefined): number => {
  if (!value) return 0;
  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return numeric / 1e9;
};

/**
 * GET /api/onchain/token-intent-settlement-reliability/[address]
 * Evaluate settlement reliability for intent-style transactions.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const pageSize = Math.min(parseInt(searchParams.get('limit') || '120', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-intent-reliability:${normalizedAddress}:${chainId || '1'}:${pageSize}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId, 10) : 1;

    const response = await goldrushClient.get<{
      data?: { items?: GoldrushTransaction[] };
    }>(`/v1/${targetChainId}/address/${normalizedAddress}/transactions_v3/`, {
      'page-size': pageSize,
      'with-logs': true,
      'no-logs': false,
    });

    const transactions = response?.data?.items || [];
    const intentTransactions = transactions.filter(looksLikeIntent);
    const dataset = intentTransactions.length ? intentTransactions : transactions.slice(0, 25);

    const total = dataset.length;
    const successes = dataset.filter((tx) => tx.successful).length;
    const failures = total - successes;
    const successRate = total ? successes / total : 0;

    const gasUsedSamples = dataset.map((tx) => tx.gas_spent || 0).filter(Boolean);
    const feeUsdSamples = dataset.map((tx) => tx.fees_paid_quote || 0).filter(Boolean);
    const gasPriceSamples = dataset.map((tx) => toGwei(tx.gas_price)).filter(Boolean);

    const solverCounts = dataset.reduce<Record<string, number>>((acc, tx) => {
      const solver = tx.to_address_label || tx.to_address || 'unknown';
      acc[solver] = (acc[solver] || 0) + 1;
      return acc;
    }, {});

    const solverDistribution = Object.entries(solverCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([solver, count]) => ({
        solver,
        count,
        share: total ? +(count / total).toFixed(3) : 0,
      }));

    const reliabilityTier =
      successRate >= 0.95
        ? 'rock-solid'
        : successRate >= 0.85
        ? 'stable'
        : successRate >= 0.65
        ? 'needs-attention'
        : 'unreliable';

    const recentIntents = dataset.slice(0, 8).map((tx) => ({
      txHash: tx.tx_hash,
      settledAt: tx.block_signed_at,
      solver: tx.to_address_label || tx.to_address,
      success: tx.successful,
      gasUsed: tx.gas_spent || 0,
      feeUsd: tx.fees_paid_quote || 0,
    }));

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      evaluated: total,
      successRate: +successRate.toFixed(4),
      failureCount: failures,
      avgGasUsed: Math.round(average(gasUsedSamples)),
      avgFeeUsd: +average(feeUsdSamples).toFixed(4),
      avgGasPriceGwei: +average(gasPriceSamples).toFixed(4),
      solverDistribution,
      reliabilityTier,
      recentIntents,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Intent settlement reliability error:', error);
    return NextResponse.json(
      {
        error: 'Failed to evaluate intent settlement reliability',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

