import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const MEV_HINTS = [
  'flashbots',
  'mev',
  'rebate',
  'refund',
  'cow',
  'cowswap',
  'relay',
  'builder',
  'bloxroute',
  'protect',
  'solver',
  'orderflow',
  'intent',
];

const TOKEN_PRICE_HINTS: Record<string, number> = {
  usdc: 1,
  usdt: 1,
  dai: 1,
  weth: 3200,
  eth: 3200,
  steth: 3200,
  wbtc: 68000,
};

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

const parseTokenAmount = (rawValue: string | number | null | undefined, decimals = 18) => {
  if (rawValue === undefined || rawValue === null) return 0;
  const raw = typeof rawValue === 'number' ? rawValue.toString() : rawValue;
  try {
    const bigValue = BigInt(raw);
    const scale = 10n ** BigInt(Math.min(decimals, 30));
    return Number(bigValue) / Number(scale);
  } catch (error) {
    return 0;
  }
};

const detectRefundSource = (tx: any) => {
  const label = normalize(tx.to_address_label) || normalize(tx.from_address_label);
  if (label) {
    for (const hint of MEV_HINTS) {
      if (label.includes(hint)) {
        return tx.to_address_label || tx.from_address_label || 'unknown';
      }
    }
  }

  const senderNames = tx.log_events?.map((log: any) => normalize(log.sender_name)) || [];
  const decodedNames = tx.log_events?.map((log: any) => normalize(log.decoded?.name)) || [];
  const combined = [...senderNames, ...decodedNames].find((name) =>
    MEV_HINTS.some((hint) => name.includes(hint))
  );

  if (combined) {
    return combined.trim();
  }

  return 'unattributed';
};

const looksLikeRefund = (tx: any, wallet: string) => {
  const inbound = normalize(tx.to_address) === wallet;
  if (!inbound) {
    return false;
  }

  const labelBlob = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)}`;
  const labelMatch = MEV_HINTS.some((hint) => labelBlob.includes(hint));

  const logMatch = tx.log_events?.some((log: any) => {
    const senderName = normalize(log.sender_name);
    const decodedName = normalize(log.decoded?.name);
    return MEV_HINTS.some(
      (hint) => senderName.includes(hint) || decodedName.includes(hint)
    );
  });

  const lowValueHighGas = toNumber(tx.value_quote) > 0 && toNumber(tx.value_quote) < 50 && toNumber(tx.gas_quote) > 1;

  return labelMatch || logMatch || lowValueHighGas;
};

const extractTokenRefundUsd = (logs: any[] | undefined, wallet: string) => {
  if (!logs?.length) return 0;
  let total = 0;

  logs.forEach((log) => {
    if (normalize(log.decoded?.name) !== 'transfer') {
      return;
    }
    const params = log.decoded?.params as Array<{ name: string; value: string }> | undefined;
    if (!params) {
      return;
    }

    const toParam = params.find((param) => normalize(param.name) === 'to');
    if (normalize(toParam?.value) !== wallet) {
      return;
    }

    const valueParam = params.find((param) => normalize(param.name) === 'value');
    const amount = parseTokenAmount(valueParam?.value, log.sender_contract_decimals);
    if (!amount) {
      return;
    }

    const symbol = normalize(log.sender_contract_ticker_symbol);
    const price = TOKEN_PRICE_HINTS[symbol] ?? 0;
    if (!price) {
      return;
    }

    total += amount * price;
  });

  return total;
};

/**
 * GET /api/onchain/token-mev-refund-attribution/[address]
 * Attribute MEV refunds (Flashbots Protect, CoW relays, paymasters) back to their sources.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '30', 10), 120);
    const pageSize = Math.min(parseInt(searchParams.get('limit') || '150', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-mev-refund:${normalizedAddress}:${
      chainId || '1'
    }:${lookbackDays}:${pageSize}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId, 10) : 1;
    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;

    const response = await goldrushClient.get<{
      data?: { items?: any[] };
    }>(`/v1/${targetChainId}/address/${normalizedAddress}/transactions_v3/`, {
      'page-size': pageSize,
      'with-logs': true,
    });

    const transactions = response?.data?.items || [];

    const refundEvents: Array<{
      txHash: string;
      chainId: number;
      refundUsd: number;
      nativeRefundUsd: number;
      tokenRefundUsd: number;
      detectedAt: string;
      source: string;
      gasUsd: number;
    }> = [];

    transactions.forEach((tx: any) => {
      if (!withinLookback(tx.block_signed_at, cutoff)) {
        return;
      }

      if (!looksLikeRefund(tx, normalizedAddress)) {
        return;
      }

      const nativeRefundUsd = toNumber(tx.value_quote);
      const tokenRefundUsd = extractTokenRefundUsd(tx.log_events, normalizedAddress);
      const refundUsd = +(nativeRefundUsd + tokenRefundUsd).toFixed(4);

      if (refundUsd <= 0) {
        return;
      }

      refundEvents.push({
        txHash: tx.tx_hash,
        chainId: targetChainId,
        refundUsd,
        nativeRefundUsd,
        tokenRefundUsd,
        detectedAt: tx.block_signed_at,
        source: detectRefundSource(tx),
        gasUsd: +toNumber(tx.gas_quote).toFixed(4),
      });
    });

    const refundTotalUsd = refundEvents.reduce((sum, event) => sum + event.refundUsd, 0);
    const avgRefundUsd = refundEvents.length
      ? refundTotalUsd / refundEvents.length
      : 0;

    const sources = refundEvents.reduce<Record<string, { count: number; totalUsd: number }>>(
      (acc, event) => {
        acc[event.source] = acc[event.source] || { count: 0, totalUsd: 0 };
        acc[event.source].count += 1;
        acc[event.source].totalUsd += event.refundUsd;
        return acc;
      },
      {}
    );

    const sourceBreakdown = Object.entries(sources)
      .map(([source, data]) => ({
        source,
        count: data.count,
        totalUsd: +data.totalUsd.toFixed(4),
        avgUsd: +(data.totalUsd / data.count).toFixed(4),
      }))
      .sort((a, b) => b.totalUsd - a.totalUsd);

    const refundRate = transactions.length
      ? (refundEvents.length / transactions.length) * 100
      : 0;

    const coverageTier = refundRate >= 10
      ? 'high'
      : refundRate >= 3
      ? 'medium'
      : 'low';

    const responsePayload = {
      address: normalizedAddress,
      chainId: targetChainId,
      lookbackDays,
      inspectedTransactions: transactions.length,
      refundCount: refundEvents.length,
      refundRate: +refundRate.toFixed(2),
      totalRefundUsd: +refundTotalUsd.toFixed(4),
      avgRefundUsd: +avgRefundUsd.toFixed(4),
      coverageTier,
      topSources: sourceBreakdown.slice(0, 6),
      recentRefunds: refundEvents.slice(0, 15),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, responsePayload, 60 * 1000);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('MEV refund attribution error:', error);
    return NextResponse.json(
      {
        error: 'Failed to attribute MEV refunds',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
