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

const hourOfDay = (timestamp: string) => new Date(timestamp).getUTCHours();

/**
 * GET /api/onchain/token-wallet-behavior-fingerprint/[address]
 * Generate a behavioral fingerprint from transaction patterns.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '90', 10), 365);
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 300);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-wallet-behavior-fingerprint:${normalizedAddress}:${lookbackDays}:${limit}`;
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
      successful: boolean;
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
              successful: tx.successful !== false,
            });
          }
        });
      } catch (error) {
        console.error(`Behavior fingerprint fetch failed on chain ${chain.id}:`, error);
      }
    }

    if (!allTxs.length) {
      const emptyPayload = {
        address: normalizedAddress,
        lookbackDays,
        fingerprint: {},
        timestamp: Date.now(),
      } as const;
      cache.set(cacheKey, emptyPayload, 60 * 1000);
      return NextResponse.json(emptyPayload);
    }

    const hourDistribution = new Array(24).fill(0);
    allTxs.forEach((tx) => {
      hourDistribution[hourOfDay(tx.occurredAt)] += 1;
    });

    const peakHour = hourDistribution.indexOf(Math.max(...hourDistribution));
    const successRate = (allTxs.filter((tx) => tx.successful).length / allTxs.length) * 100;
    const avgValueUsd = allTxs.reduce((sum, tx) => sum + tx.valueUsd, 0) / allTxs.length;
    const avgGasUsd = allTxs.reduce((sum, tx) => sum + tx.gasUsd, 0) / allTxs.length;
    const chainPreference = allTxs.reduce<Record<number, number>>((acc, tx) => {
      acc[tx.chainId] = (acc[tx.chainId] || 0) + 1;
      return acc;
    }, {});

    const preferredChain = Object.entries(chainPreference)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    const fingerprint = {
      totalTransactions: allTxs.length,
      successRate: +successRate.toFixed(2),
      avgValueUsd: +avgValueUsd.toFixed(2),
      avgGasUsd: +avgGasUsd.toFixed(2),
      peakHour,
      preferredChain: preferredChain ? parseInt(preferredChain, 10) : null,
      hourDistribution: hourDistribution.map((count) => +((count / allTxs.length) * 100).toFixed(2)),
      chainDistribution: Object.entries(chainPreference).map(([chainId, count]) => ({
        chainId: parseInt(chainId, 10),
        share: +((count / allTxs.length) * 100).toFixed(2),
      })),
    };

    const payload = {
      address: normalizedAddress,
      lookbackDays,
      fingerprint,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Wallet behavior fingerprint error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate behavior fingerprint',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
