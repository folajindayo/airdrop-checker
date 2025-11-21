import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress, SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const QUEST_PLATFORMS = [
  { name: 'Galxe', keywords: ['galxe', 'oat'] },
  { name: 'Layer3', keywords: ['layer3'] },
  { name: 'Rabbithole', keywords: ['rabbithole'] },
  { name: 'Zealy', keywords: ['zealy', 'crew3'] },
  { name: 'QuestN', keywords: ['questn'] },
  { name: 'Guild', keywords: ['guild', 'guildxyz'] },
  { name: 'Intract', keywords: ['intract'] },
] as const;

const QUEST_CHAIN_IDS = [1, 10, 137, 42161, 8453];

const normalize = (value?: string | null) => (value || '').toLowerCase();

const toNumber = (value?: string | number | null): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const msToDays = (ms: number) => Math.floor(ms / (1000 * 60 * 60 * 24));

const getLookbackDays = (value?: string | null) => {
  if (!value) return 45;
  const parsed = parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 45;
  return Math.min(parsed, 120);
};

const uniqueDayKey = (timestamp: string) => {
  const dt = new Date(timestamp);
  return `${dt.getUTCFullYear()}-${dt.getUTCMonth()}-${dt.getUTCDate()}`;
};

const calculateStreak = (dayKeys: string[]) => {
  if (!dayKeys.length) return 0;
  const sorted = Array.from(new Set(dayKeys))
    .map((key) => {
      const [y, m, d] = key.split('-').map(Number);
      return Date.UTC(y, m, d);
    })
    .sort((a, b) => a - b);

  let best = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const diffDays = msToDays(sorted[i] - sorted[i - 1]);
    if (diffDays === 1) {
      current += 1;
    } else {
      current = 1;
    }
    best = Math.max(best, current);
  }

  return best;
};

const detectPlatform = (tx: any) => {
  const surfaces = [
    tx.to_address_label,
    tx.from_address_label,
    ...(tx.log_events?.map((log: any) => log.sender_name) ?? []),
    ...(tx.log_events?.map((log: any) => log.decoded?.name) ?? []),
  ].map((value) => normalize(value));

  for (const platform of QUEST_PLATFORMS) {
    if (
      platform.keywords.some((keyword) =>
        surfaces.some((surface) => surface.includes(keyword))
      )
    ) {
      return platform.name;
    }
  }

  return null;
};

const withinLookback = (timestamp: string, cutoff: number) =>
  new Date(timestamp).getTime() >= cutoff;

/**
 * GET /api/onchain/token-quest-completion-ledger/[address]
 * Build a ledger of onchain quest completions and engagement streaks.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const lookbackDays = getLookbackDays(searchParams.get('days'));
    const pageSize = Math.min(
      parseInt(searchParams.get('limit') || '120', 10),
      200
    );

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-quest-ledger:${normalizedAddress}:${
      chainId || 'multi'
    }:${lookbackDays}:${pageSize}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChains = chainId
      ? SUPPORTED_CHAINS.filter((chain) => chain.id === parseInt(chainId, 10))
      : SUPPORTED_CHAINS.filter((chain) => QUEST_CHAIN_IDS.includes(chain.id));

    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
    const completions: Array<{
      platform: string;
      chainId: number;
      txHash: string;
      completedAt: string;
      gasUsd: number;
      label?: string | null;
    }> = [];

    for (const chain of targetChains) {
      try {
        const response = await goldrushClient.get<{
          data?: { items?: any[] };
        }>(`/v1/${chain.id}/address/${normalizedAddress}/transactions_v3/`, {
          'page-size': pageSize,
          'with-logs': true,
        });

        const items = response?.data?.items || [];
        items.forEach((tx: any) => {
          if (!withinLookback(tx.block_signed_at, cutoff)) {
            return;
          }

          const platform = detectPlatform(tx);
          if (!platform) {
            return;
          }

          completions.push({
            platform,
            chainId: chain.id,
            txHash: tx.tx_hash,
            completedAt: tx.block_signed_at,
            gasUsd: +toNumber(tx.gas_quote).toFixed(3),
            label: tx.to_address_label || tx.from_address_label,
          });
        });
      } catch (error) {
        console.error(`Quest ledger fetch failed on chain ${chain.id}:`, error);
      }
    }

    completions.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    const platformBreakdown = completions.reduce<Record<string, { count: number; lastSeen: string }>>(
      (acc, completion) => {
        acc[completion.platform] = acc[completion.platform] || {
          count: 0,
          lastSeen: completion.completedAt,
        };
        acc[completion.platform].count += 1;
        if (
          new Date(completion.completedAt).getTime() >
          new Date(acc[completion.platform].lastSeen).getTime()
        ) {
          acc[completion.platform].lastSeen = completion.completedAt;
        }
        return acc;
      },
      {}
    );

    const dayKeys = completions.map((completion) => uniqueDayKey(completion.completedAt));
    const streakDays = calculateStreak(dayKeys);
    const avgGasUsd =
      completions.reduce((sum, completion) => sum + completion.gasUsd, 0) /
      (completions.length || 1);

    const responsePayload = {
      address: normalizedAddress,
      chainsInspected: targetChains.map((chain) => chain.id),
      lookbackDays,
      totalCompletions: completions.length,
      avgGasUsd: +avgGasUsd.toFixed(3),
      activePlatforms: Object.keys(platformBreakdown).length,
      streakDays,
      recentCompletions: completions.slice(0, 20),
      platformBreakdown: Object.entries(platformBreakdown)
        .map(([platform, stats]) => ({
          platform,
          count: stats.count,
          lastSeen: stats.lastSeen,
        }))
        .sort((a, b) => b.count - a.count),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, responsePayload, 60 * 1000);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Quest completion ledger error:', error);
    return NextResponse.json(
      {
        error: 'Failed to build quest completion ledger',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
