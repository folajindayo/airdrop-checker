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

/**
 * GET /api/onchain/token-velocity-tracker/[address]
 * Track token velocity (turnover rate) for tokens held by the wallet.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '30', 10), 180);
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 300);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-token-velocity:${normalizedAddress}:${
      chainId || 'multi'
    }:${lookbackDays}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
    const targetChains = chainId
      ? SUPPORTED_CHAINS.filter((chain) => chain.id === parseInt(chainId, 10))
      : SUPPORTED_CHAINS;

    const tokenMovements: Array<{
      tokenAddress: string;
      symbol: string | null;
      chainId: number;
      direction: 'in' | 'out';
      amount: number;
      valueUsd: number;
      occurredAt: string;
      txHash: string;
    }> = [];

    for (const chain of targetChains) {
      try {
        const response = await goldrushClient.get<{
          data?: { items?: any[] };
        }>(`/v1/${chain.id}/address/${normalizedAddress}/transactions_v3/`, {
          'page-size': limit,
          'with-logs': true,
        });
        const items = response?.data?.items || [];
        items.forEach((tx) => {
          if (new Date(tx.block_signed_at).getTime() < cutoff) {
            return;
          }
          const isIncoming = normalize(tx.to_address) === normalizedAddress;
          const isOutgoing = normalize(tx.from_address) === normalizedAddress;
          if (!isIncoming && !isOutgoing) {
            return;
          }

          const logs = tx.log_events || [];
          logs.forEach((log: any) => {
            if (normalize(log.decoded?.name) !== 'transfer') {
              return;
            }
            const params = log.decoded?.params as Array<{ name: string; value: string }> | undefined;
            if (!params) {
              return;
            }
            const toParam = params.find((p) => normalize(p.name) === 'to');
            const fromParam = params.find((p) => normalize(p.name) === 'from');
            const valueParam = params.find((p) => normalize(p.name) === 'value');

            const isTokenIn = normalize(toParam?.value) === normalizedAddress;
            const isTokenOut = normalize(fromParam?.value) === normalizedAddress;
            if (!isTokenIn && !isTokenOut) {
              return;
            }

            const tokenAddress = log.sender_address || 'unknown';
            const amount = parseTokenAmount(valueParam?.value, log.sender_contract_decimals);
            const valueUsd = toNumber(log.quote_rate) * amount;

            tokenMovements.push({
              tokenAddress: normalize(tokenAddress),
              symbol: log.sender_contract_ticker_symbol || null,
              chainId: chain.id,
              direction: isTokenIn ? 'in' : 'out',
              amount: +amount.toFixed(6),
              valueUsd: +valueUsd.toFixed(2),
              occurredAt: tx.block_signed_at,
              txHash: tx.tx_hash,
            });
          });
        });
      } catch (error) {
        console.error(`Token velocity fetch failed on chain ${chain.id}:`, error);
      }
    }

    if (!tokenMovements.length) {
      const emptyPayload = {
        address: normalizedAddress,
        lookbackDays,
        tokensTracked: 0,
        totalInflowUsd: 0,
        totalOutflowUsd: 0,
        velocityScore: 0,
        topTokens: [],
        timestamp: Date.now(),
      } as const;
      cache.set(cacheKey, emptyPayload, 60 * 1000);
      return NextResponse.json(emptyPayload);
    }

    const tokenStats = tokenMovements.reduce<Record<string, {
      symbol: string | null;
      inflowUsd: number;
      outflowUsd: number;
      movements: number;
      firstSeen: string;
      lastSeen: string;
    }>>((acc, movement) => {
      const key = `${movement.chainId}:${movement.tokenAddress}`;
      acc[key] = acc[key] || {
        symbol: movement.symbol,
        inflowUsd: 0,
        outflowUsd: 0,
        movements: 0,
        firstSeen: movement.occurredAt,
        lastSeen: movement.occurredAt,
      };
      if (movement.direction === 'in') {
        acc[key].inflowUsd += movement.valueUsd;
      } else {
        acc[key].outflowUsd += movement.valueUsd;
      }
      acc[key].movements += 1;
      if (new Date(movement.occurredAt).getTime() < new Date(acc[key].firstSeen).getTime()) {
        acc[key].firstSeen = movement.occurredAt;
      }
      if (new Date(movement.occurredAt).getTime() > new Date(acc[key].lastSeen).getTime()) {
        acc[key].lastSeen = movement.occurredAt;
      }
      return acc;
    }, {});

    const totalInflowUsd = tokenMovements
      .filter((m) => m.direction === 'in')
      .reduce((sum, m) => sum + m.valueUsd, 0);
    const totalOutflowUsd = tokenMovements
      .filter((m) => m.direction === 'out')
      .reduce((sum, m) => sum + m.valueUsd, 0);
    const totalVolumeUsd = totalInflowUsd + totalOutflowUsd;

    const topTokens = Object.entries(tokenStats)
      .map(([key, stats]) => {
        const [chainIdStr, tokenAddress] = key.split(':');
        const turnover = stats.inflowUsd > 0
          ? Math.min(100, (stats.outflowUsd / stats.inflowUsd) * 100)
          : 0;
        return {
          tokenAddress,
          chainId: parseInt(chainIdStr, 10),
          symbol: stats.symbol,
          inflowUsd: +stats.inflowUsd.toFixed(2),
          outflowUsd: +stats.outflowUsd.toFixed(2),
          turnoverRate: +turnover.toFixed(2),
          movements: stats.movements,
        };
      })
      .sort((a, b) => b.inflowUsd + b.outflowUsd - (a.inflowUsd + a.outflowUsd))
      .slice(0, 20);

    const velocityScore = totalInflowUsd > 0
      ? Math.min(100, (totalOutflowUsd / totalInflowUsd) * 100)
      : 0;

    const payload = {
      address: normalizedAddress,
      lookbackDays,
      tokensTracked: Object.keys(tokenStats).length,
      totalInflowUsd: +totalInflowUsd.toFixed(2),
      totalOutflowUsd: +totalOutflowUsd.toFixed(2),
      totalVolumeUsd: +totalVolumeUsd.toFixed(2),
      velocityScore: +velocityScore.toFixed(2),
      topTokens,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Token velocity tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track token velocity',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

