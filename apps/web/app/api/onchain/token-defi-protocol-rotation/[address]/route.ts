import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress, SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const DEFI_PROTOCOLS = [
  { name: 'Uniswap', hints: ['uniswap', 'uni'] },
  { name: 'Aave', hints: ['aave'] },
  { name: 'Compound', hints: ['compound', 'comet'] },
  { name: 'Curve', hints: ['curve'] },
  { name: 'Balancer', hints: ['balancer', 'bal'] },
  { name: 'MakerDAO', hints: ['maker', 'dai'] },
  { name: 'Lido', hints: ['lido', 'steth'] },
  { name: 'Rocket Pool', hints: ['rocket', 'reth'] },
  { name: 'Convex', hints: ['convex'] },
  { name: 'Yearn', hints: ['yearn', 'yfi'] },
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

const detectProtocol = (tx: any): string | null => {
  const blob = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)} ${
    tx.log_events?.map((log: any) => normalize(log.sender_name)).join(' ') || ''
  }`;
  for (const protocol of DEFI_PROTOCOLS) {
    if (protocol.hints.some((hint) => blob.includes(hint))) {
      return protocol.name;
    }
  }
  return null;
};

/**
 * GET /api/onchain/token-defi-protocol-rotation/[address]
 * Analyze DeFi protocol rotation patterns and switching frequency.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '90', 10), 365);
    const limit = Math.min(parseInt(searchParams.get('limit') || '180', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-defi-protocol-rotation:${normalizedAddress}:${
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

    const protocolEvents: Array<{
      protocol: string;
      chainId: number;
      occurredAt: string;
      txHash: string;
      valueUsd: number;
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
          const protocol = detectProtocol(tx);
          if (protocol) {
            protocolEvents.push({
              protocol,
              chainId: chain.id,
              occurredAt: tx.block_signed_at,
              txHash: tx.tx_hash,
              valueUsd: +toNumber(tx.value_quote).toFixed(2),
            });
          }
        });
      } catch (error) {
        console.error(`Protocol rotation fetch failed on chain ${chain.id}:`, error);
      }
    }

    if (!protocolEvents.length) {
      const emptyPayload = {
        address: normalizedAddress,
        lookbackDays,
        protocolsTouched: 0,
        rotations: 0,
        rotationRate: 0,
        protocolBreakdown: [],
        recentRotations: [],
        timestamp: Date.now(),
      } as const;
      cache.set(cacheKey, emptyPayload, 60 * 1000);
      return NextResponse.json(emptyPayload);
    }

    protocolEvents.sort(
      (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
    );

    let rotations = 0;
    for (let i = 1; i < protocolEvents.length; i++) {
      if (protocolEvents[i].protocol !== protocolEvents[i - 1].protocol) {
        rotations += 1;
      }
    }

    const protocolStats = protocolEvents.reduce<Record<string, {
      count: number;
      totalValueUsd: number;
      firstSeen: string;
      lastSeen: string;
    }>>((acc, event) => {
      acc[event.protocol] = acc[event.protocol] || {
        count: 0,
        totalValueUsd: 0,
        firstSeen: event.occurredAt,
        lastSeen: event.occurredAt,
      };
      acc[event.protocol].count += 1;
      acc[event.protocol].totalValueUsd += event.valueUsd;
      if (new Date(event.occurredAt).getTime() < new Date(acc[event.protocol].firstSeen).getTime()) {
        acc[event.protocol].firstSeen = event.occurredAt;
      }
      if (new Date(event.occurredAt).getTime() > new Date(acc[event.protocol].lastSeen).getTime()) {
        acc[event.protocol].lastSeen = event.occurredAt;
      }
      return acc;
    }, {});

    const protocolBreakdown = Object.entries(protocolStats)
      .map(([protocol, stats]) => ({
        protocol,
        interactions: stats.count,
        totalValueUsd: +stats.totalValueUsd.toFixed(2),
        share: +((stats.count / protocolEvents.length) * 100).toFixed(2),
        firstSeen: stats.firstSeen,
        lastSeen: stats.lastSeen,
      }))
      .sort((a, b) => b.interactions - a.interactions);

    const rotationRate = protocolEvents.length > 1
      ? +((rotations / (protocolEvents.length - 1)) * 100).toFixed(2)
      : 0;

    const recentRotations = protocolEvents
      .filter((event, idx) => idx > 0 && event.protocol !== protocolEvents[idx - 1].protocol)
      .slice(-10)
      .map((event, idx) => ({
        from: idx > 0 ? protocolEvents[protocolEvents.indexOf(event) - 1].protocol : null,
        to: event.protocol,
        occurredAt: event.occurredAt,
        txHash: event.txHash,
      }));

    const payload = {
      address: normalizedAddress,
      lookbackDays,
      protocolsTouched: protocolBreakdown.length,
      totalInteractions: protocolEvents.length,
      rotations,
      rotationRate,
      protocolBreakdown,
      recentRotations,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('DeFi protocol rotation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze DeFi protocol rotation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

