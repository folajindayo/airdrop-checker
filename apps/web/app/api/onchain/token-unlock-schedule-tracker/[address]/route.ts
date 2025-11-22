import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const UNLOCK_HINTS = ['vest', 'unlock', 'release', 'claim', 'withdraw'];

const normalize = (value?: string | null) => (value || '').toLowerCase();
const toNumber = (value?: string | number | null): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const looksLikeUnlock = (tx: any) => {
  const blob = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)} ${
    tx.log_events?.map((log: any) => normalize(log.decoded?.name)).join(' ') || ''
  }`;
  return UNLOCK_HINTS.some((hint) => blob.includes(hint));
};

/**
 * GET /api/onchain/token-unlock-schedule-tracker/[address]
 * Track token unlock schedules and vesting events.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '180', 10), 730);
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 300);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-unlock-schedule:${normalizedAddress}:${chainId || '1'}:${lookbackDays}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId, 10) : 1;
    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;

    const response = await goldrushClient.get<{
      data?: { items?: any[] };
    }>(`/v1/${targetChainId}/address/${normalizedAddress}/transactions_v3/`, {
      'page-size': limit,
      'with-logs': true,
    });

    const items = (response?.data?.items || []).filter(
      (tx) => new Date(tx.block_signed_at).getTime() >= cutoff && looksLikeUnlock(tx)
    );

    const unlockEvents = items.map((tx: any) => ({
      txHash: tx.tx_hash,
      valueUsd: toNumber(tx.value_quote),
      occurredAt: tx.block_signed_at,
      contract: normalize(tx.to_address),
    }));

    const contractBreakdown = unlockEvents.reduce<Record<string, {
      count: number;
      totalUnlockedUsd: number;
      firstUnlock: string;
      lastUnlock: string;
    }>>((acc, event) => {
      if (!acc[event.contract]) {
        acc[event.contract] = {
          count: 0,
          totalUnlockedUsd: 0,
          firstUnlock: event.occurredAt,
          lastUnlock: event.occurredAt,
        };
      }
      acc[event.contract].count += 1;
      acc[event.contract].totalUnlockedUsd += event.valueUsd;
      if (new Date(event.occurredAt).getTime() < new Date(acc[event.contract].firstUnlock).getTime()) {
        acc[event.contract].firstUnlock = event.occurredAt;
      }
      if (new Date(event.occurredAt).getTime() > new Date(acc[event.contract].lastUnlock).getTime()) {
        acc[event.contract].lastUnlock = event.occurredAt;
      }
      return acc;
    }, {});

    const schedule = Object.entries(contractBreakdown)
      .map(([contract, stats]) => ({
        contract,
        unlockCount: stats.count,
        totalUnlockedUsd: +stats.totalUnlockedUsd.toFixed(2),
        firstUnlock: stats.firstUnlock,
        lastUnlock: stats.lastUnlock,
        avgUnlockUsd: +(stats.totalUnlockedUsd / stats.count).toFixed(2),
      }))
      .sort((a, b) => new Date(b.lastUnlock).getTime() - new Date(a.lastUnlock).getTime());

    const totalUnlocked = unlockEvents.reduce((sum, event) => sum + event.valueUsd, 0);

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      lookbackDays,
      totalUnlockEvents: unlockEvents.length,
      totalUnlockedUsd: +totalUnlocked.toFixed(2),
      uniqueContracts: schedule.length,
      schedule,
      recentUnlocks: unlockEvents.slice(0, 10),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Token unlock schedule tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track unlock schedules',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
