import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const BRIDGE_HINTS = ['bridge', 'portal', 'gateway', 'hop', 'wormhole', 'layerzero', 'router'];

const normalize = (value?: string | null) => (value || '').toLowerCase();
const toNumber = (value?: string | number | null) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const looksBridgey = (tx: any) => {
  const blob = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)} ${
    tx.log_events?.map((log: any) => normalize(log.sender_name)).join(' ') || ''
  }`;
  return BRIDGE_HINTS.some((hint) => blob.includes(hint));
};

const matchFinalize = (
  deposit: { initTime: string; valueUsd: number },
  finalizations: Array<{ settledAt: string; valueUsd: number }>
) => {
  const initMs = new Date(deposit.initTime).getTime();
  let choice = -1;
  let minDelta = Number.POSITIVE_INFINITY;

  finalizations.forEach((event, idx) => {
    const settleMs = new Date(event.settledAt).getTime();
    if (settleMs < initMs) {
      return;
    }
    const ratio = deposit.valueUsd > 0
      ? Math.abs(event.valueUsd - deposit.valueUsd) / deposit.valueUsd
      : 0;
    if (ratio > 0.25) {
      return;
    }
    const delta = settleMs - initMs;
    if (delta < minDelta) {
      minDelta = delta;
      choice = idx;
    }
  });

  if (choice === -1) {
    return null;
  }

  const [match] = finalizations.splice(choice, 1);
  return match;
};

/**
 * GET /api/onchain/token-bridge-finality-gap/[address]
 * Estimate gap between bridge deposits and claim/finality events on Ethereum.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '45', 10), 120);
    const limit = Math.min(parseInt(searchParams.get('limit') || '160', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-bridge-finality-gap:${normalizedAddress}:${lookbackDays}:${limit}`;
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
      (tx) => new Date(tx.block_signed_at).getTime() >= cutoff && looksBridgey(tx)
    );

    const deposits = items
      .filter((tx) => normalize(tx.from_address) === normalizedAddress)
      .map((tx) => ({
        txHash: tx.tx_hash,
        initTime: tx.block_signed_at,
        valueUsd: +toNumber(tx.value_quote).toFixed(2),
      }));

    const finalizations = items
      .filter((tx) => normalize(tx.to_address) === normalizedAddress)
      .map((tx) => ({
        txHash: tx.tx_hash,
        settledAt: tx.block_signed_at,
        valueUsd: +toNumber(tx.value_quote).toFixed(2),
      }));

    const settlementPool = finalizations.slice();
    const matched: Array<{
      depositHash: string;
      finalizeHash: string;
      waitMinutes: number;
      volumeUsd: number;
    }> = [];
    const pending: Array<{
      depositHash: string;
      ageMinutes: number;
      volumeUsd: number;
    }> = [];

    deposits.forEach((deposit) => {
      const match = matchFinalize(
        { initTime: deposit.initTime, valueUsd: deposit.valueUsd },
        settlementPool
      );
      if (match) {
        const waitMinutes =
          (new Date(match.settledAt).getTime() - new Date(deposit.initTime).getTime()) /
          (1000 * 60);
        matched.push({
          depositHash: deposit.txHash,
          finalizeHash: match.txHash,
          waitMinutes: +waitMinutes.toFixed(2),
          volumeUsd: deposit.valueUsd,
        });
      } else {
        const ageMinutes = (Date.now() - new Date(deposit.initTime).getTime()) / (1000 * 60);
        pending.push({
          depositHash: deposit.txHash,
          ageMinutes: +ageMinutes.toFixed(2),
          volumeUsd: deposit.valueUsd,
        });
      }
    });

    const avgFinalityMinutes = matched.length
      ? matched.reduce((sum, item) => sum + item.waitMinutes, 0) / matched.length
      : null;
    const longestPendingMinutes = pending.length
      ? Math.max(...pending.map((item) => item.ageMinutes))
      : null;

    const payload = {
      address: normalizedAddress,
      lookbackDays,
      deposits: deposits.length,
      finalizations: finalizations.length,
      matched: matched.length,
      pending: pending.length,
      avgFinalityMinutes: avgFinalityMinutes ? +avgFinalityMinutes.toFixed(2) : null,
      longestPendingMinutes: longestPendingMinutes
        ? +longestPendingMinutes.toFixed(2)
        : null,
      recentMatched: matched.slice(0, 10),
      pendingDeposits: pending.slice(0, 10),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Bridge finality gap error:', error);
    return NextResponse.json(
      {
        error: 'Failed to evaluate bridge finality gap',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
