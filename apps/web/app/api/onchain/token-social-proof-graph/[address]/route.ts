import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress, SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const SOCIAL_SIGNALS = [
  {
    category: 'poap',
    hints: ['poap', 'proof of attendance'],
  },
  {
    category: 'governance',
    hints: ['snapshot', 'tally', 'delegate', 'vote'],
  },
  {
    category: 'quest',
    hints: ['galxe', 'layer3', 'rabbithole', 'quest'],
  },
  {
    category: 'identity',
    hints: ['ens', 'lens', 'farcaster', 'passport'],
  },
  {
    category: 'referrals',
    hints: ['referral', 'ambassador', 'affiliate'],
  },
] as const;

const normalize = (value?: string | null) => (value || '').toLowerCase();

const dayKey = (timestamp: string) => {
  const dt = new Date(timestamp);
  return `${dt.getUTCFullYear()}-${dt.getUTCMonth()}-${dt.getUTCDate()}`;
};

const toNumber = (value?: string | number | null): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const labelMatches = (hints: readonly string[], ...labels: (string | null | undefined)[]) => {
  const blob = labels.map((label) => normalize(label)).join(' ');
  return hints.some((hint) => blob.includes(hint));
};

/**
 * GET /api/onchain/token-social-proof-graph/[address]
 * Build a social proof graph from POAPs, quests, and governance signals.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '120', 10), 365);
    const pageSize = Math.min(parseInt(searchParams.get('limit') || '120', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-social-proof-graph:${normalizedAddress}:${
      chainId || 'multi'
    }:${lookbackDays}:${pageSize}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;

    const targetChains = chainId
      ? SUPPORTED_CHAINS.filter((chain) => chain.id === parseInt(chainId, 10))
      : SUPPORTED_CHAINS;

    const signals: Array<{
      category: string;
      chainId: number;
      txHash: string;
      occurredAt: string;
      label: string | null;
      usdValue: number;
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
        items.forEach((tx) => {
          const blockTime = new Date(tx.block_signed_at).getTime();
          if (blockTime < cutoff) {
            return;
          }
          SOCIAL_SIGNALS.forEach((signal) => {
            if (
              labelMatches(
                signal.hints,
                tx.to_address_label,
                tx.from_address_label,
                ...(tx.log_events?.map((log: any) => log.sender_name) || [])
              )
            ) {
              signals.push({
                category: signal.category,
                chainId: chain.id,
                txHash: tx.tx_hash,
                occurredAt: tx.block_signed_at,
                label: tx.to_address_label || tx.from_address_label || null,
                usdValue: +toNumber(tx.value_quote).toFixed(2),
              });
            }
          });
        });
      } catch (error) {
        console.error(`Social proof fetch failed on chain ${chain.id}:`, error);
      }
    }

    if (!signals.length) {
      const emptyPayload = {
        address: normalizedAddress,
        lookbackDays,
        nodes: [],
        edges: [],
        summary: {
          totalSignals: 0,
          distinctCategories: 0,
          strongestCategory: null,
        },
        recentSignals: [],
        timestamp: Date.now(),
      } as const;
      cache.set(cacheKey, emptyPayload, 60 * 1000);
      return NextResponse.json(emptyPayload);
    }

    const categoryCounts = signals.reduce<Record<string, number>>((acc, signal) => {
      acc[signal.category] = (acc[signal.category] || 0) + 1;
      return acc;
    }, {});

    const dayGrouped = signals.reduce<Record<string, Set<string>>>((acc, signal) => {
      const key = dayKey(signal.occurredAt);
      acc[key] = acc[key] || new Set<string>();
      acc[key].add(signal.category);
      return acc;
    }, {});

    const edgeWeights = new Map<string, number>();
    Object.values(dayGrouped).forEach((categories) => {
      const list = Array.from(categories);
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const key = `${list[i]}::${list[j]}`;
          edgeWeights.set(key, (edgeWeights.get(key) || 0) + 1);
        }
      }
    });

    const nodes = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      strength: +(count / signals.length).toFixed(3),
    }));

    const edges = Array.from(edgeWeights.entries()).map(([key, weight]) => {
      const [source, target] = key.split('::');
      return {
        source,
        target,
        weight,
      };
    });

    const recentSignals = signals
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      .slice(0, 15);

    const strongestCategory = nodes.sort((a, b) => b.count - a.count)[0]?.category || null;

    const responsePayload = {
      address: normalizedAddress,
      lookbackDays,
      nodes,
      edges,
      summary: {
        totalSignals: signals.length,
        distinctCategories: nodes.length,
        strongestCategory,
      },
      recentSignals,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, responsePayload, 60 * 1000);
    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Social proof graph error:', error);
    return NextResponse.json(
      {
        error: 'Failed to build social proof graph',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
