import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const RWA_PROGRAMS = [
  {
    name: 'Ondo US Dollar Yield',
    hints: ['ondo', 'usd yield', 'ousdy'],
    addresses: ['0x965f1a60be1b32be6aefa1a5040d64d519065b59'],
  },
  {
    name: 'Maple Direct Lending',
    hints: ['maple', 'mpl'],
    addresses: ['0x333049fcf60ac2e76b0fc0d1f89c371078fa7b1f'],
  },
  {
    name: 'Hifi Onchain Credit',
    hints: ['hifi', 'senior note', 'real world'],
    addresses: ['0x874c64a925e9bd57f7e06c71218f074dcc7b47bc'],
  },
  {
    name: 'Backed Finance Notes',
    hints: ['backed', 'btoken'],
    addresses: ['0x6ca558bd3eab53da1b25ab97916dd14bf6cfee4e'],
  },
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

const withinLookback = (timestamp: string, cutoff: number) =>
  new Date(timestamp).getTime() >= cutoff;

const matchesProgram = (program: (typeof RWA_PROGRAMS)[number], tx: any) => {
  const toAddress = normalize(tx.to_address);
  if (program.addresses.includes(toAddress)) {
    return true;
  }
  const labelBlob = `${normalize(tx.to_address_label)} ${normalize(
    tx.from_address_label
  )} ${normalize(tx.log_events?.[0]?.sender_name)}`;
  return program.hints.some((hint) => labelBlob.includes(hint));
};

const matchSettlement = (
  request: { valueUsd: number; requestedAt: string },
  settlements: Array<{ valueUsd: number; settledAt: string }>
) => {
  const requestTime = new Date(request.requestedAt).getTime();
  let chosenIdx = -1;
  let minTime = Number.POSITIVE_INFINITY;

  settlements.forEach((settlement, idx) => {
    const settleTime = new Date(settlement.settledAt).getTime();
    if (settleTime < requestTime) {
      return;
    }
    const ratio = request.valueUsd > 0
      ? Math.abs(settlement.valueUsd - request.valueUsd) / request.valueUsd
      : 0;
    if (ratio > 0.2) {
      return;
    }
    const timeDelta = settleTime - requestTime;
    if (timeDelta < minTime) {
      minTime = timeDelta;
      chosenIdx = idx;
    }
  });

  if (chosenIdx === -1) {
    return null;
  }

  const [match] = settlements.splice(chosenIdx, 1);
  return match;
};

/**
 * GET /api/onchain/token-rwa-redemption-latency/[address]
 * Measure latency between RWA redemption requests and settlements.
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
    const pageSize = Math.min(parseInt(searchParams.get('limit') || '160', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-rwa-redemption-latency:${normalizedAddress}:${
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

    const programSnapshots = RWA_PROGRAMS.map((program) => ({
      program: program.name,
      requests: [] as Array<{
        txHash: string;
        requestedAt: string;
        valueUsd: number;
        status: 'pending' | 'settled';
        waitDays: number;
      }>,
      settlements: [] as Array<{ valueUsd: number; settledAt: string }>,
      totalRedeemedUsd: 0,
    }));

    transactions.forEach((tx: any) => {
      if (!withinLookback(tx.block_signed_at, cutoff)) {
        return;
      }

      const programIdx = RWA_PROGRAMS.findIndex((program) => matchesProgram(program, tx));
      if (programIdx === -1) {
        return;
      }

      const snapshot = programSnapshots[programIdx];
      const senderIsWallet = normalize(tx.from_address) === normalizedAddress;
      const recipientIsWallet = normalize(tx.to_address) === normalizedAddress;
      const usdValue = toNumber(tx.value_quote);

      if (senderIsWallet && !recipientIsWallet) {
        snapshot.requests.push({
          txHash: tx.tx_hash,
          requestedAt: tx.block_signed_at,
          valueUsd: +usdValue.toFixed(2),
          status: 'pending',
          waitDays: 0,
        });
      } else if (recipientIsWallet) {
        snapshot.settlements.push({ valueUsd: usdValue, settledAt: tx.block_signed_at });
      }
    });

    const programInsights = programSnapshots
      .map((snapshot) => {
        snapshot.requests.sort(
          (a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime()
        );
        const settlementPool = snapshot.settlements.slice();

        snapshot.requests.forEach((request) => {
          const match = matchSettlement(
            { valueUsd: request.valueUsd, requestedAt: request.requestedAt },
            settlementPool
          );
          if (match) {
            const waitDays =
              (new Date(match.settledAt).getTime() - new Date(request.requestedAt).getTime()) /
              (1000 * 60 * 60 * 24);
            request.status = 'settled';
            request.waitDays = +waitDays.toFixed(2);
            snapshot.totalRedeemedUsd += request.valueUsd;
          } else {
            const pendingDays =
              (Date.now() - new Date(request.requestedAt).getTime()) / (1000 * 60 * 60 * 24);
            request.waitDays = +pendingDays.toFixed(2);
          }
        });

        const settled = snapshot.requests.filter((req) => req.status === 'settled');
        const pending = snapshot.requests.filter((req) => req.status === 'pending');
        const avgWaitDays = settled.length
          ? settled.reduce((sum, req) => sum + req.waitDays, 0) / settled.length
          : null;
        const maxPendingDays = pending.length
          ? Math.max(...pending.map((req) => req.waitDays))
          : null;

        return {
          program: snapshot.program,
          requests: snapshot.requests.length,
          settledCount: settled.length,
          pendingCount: pending.length,
          totalRedeemedUsd: +snapshot.totalRedeemedUsd.toFixed(2),
          avgWaitDays: avgWaitDays ? +avgWaitDays.toFixed(2) : null,
          longestPendingDays: maxPendingDays ? +maxPendingDays.toFixed(2) : null,
          recentRequests: snapshot.requests
            .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
            .slice(0, 10),
        };
      })
      .filter((insight) => insight.requests > 0)
      .sort((a, b) => b.totalRedeemedUsd - a.totalRedeemedUsd);

    const totalRedeemedUsd = programInsights.reduce(
      (sum, insight) => sum + insight.totalRedeemedUsd,
      0
    );
    const totalPending = programInsights.reduce((sum, insight) => sum + insight.pendingCount, 0);

    const responsePayload = {
      address: normalizedAddress,
      chainId: targetChainId,
      lookbackDays,
      programsCovered: programInsights.length,
      totalRedeemedUsd: +totalRedeemedUsd.toFixed(2),
      pendingRequests: totalPending,
      programs: programInsights,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, responsePayload, 60 * 1000);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('RWA redemption latency error:', error);
    return NextResponse.json(
      {
        error: 'Failed to evaluate RWA redemption latency',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
