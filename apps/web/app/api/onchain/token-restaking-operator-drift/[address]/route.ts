import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const RESTAKING_OPERATORS = [
  {
    name: 'EigenLayer AVS Hub',
    addresses: [
      '0xe5efbfd79b62d19756bb6a773e3963f0d4a9d4c6',
      '0x198d7387dd36b2ac10aaed3a9d879fd7f4a8c3a4',
    ],
    hints: ['eigen', 'restake', 'avs'],
  },
  {
    name: 'Karak Restaking Vault',
    addresses: ['0xe071edc66f3bf0d867b90adbfe08c86c6f58d1c7'],
    hints: ['karak', 'restake'],
  },
  {
    name: 'Symbiotic Restake Router',
    addresses: ['0x3f7e247991a74852eeefb64c08d3d81e11496b7d'],
    hints: ['symbiotic'],
  },
  {
    name: 'Puffer Vault',
    addresses: ['0x3f4edf9ac7bb7d95b1bc5b8518e1c4589c0d7f87'],
    hints: ['puffer'],
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

const matchesOperator = (operator: (typeof RESTAKING_OPERATORS)[number], tx: any) => {
  const toAddress = normalize(tx.to_address);
  if (operator.addresses.includes(toAddress)) {
    return true;
  }
  const labelBlob = `${normalize(tx.to_address_label)} ${normalize(
    tx.from_address_label
  )}`;
  return operator.hints.some((hint) => labelBlob.includes(hint));
};

const classifyAction = (tx: any, wallet: string) => {
  const fromWallet = normalize(tx.from_address) === wallet;
  const toWallet = normalize(tx.to_address) === wallet;
  const label = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)}`;
  if (fromWallet && !toWallet) {
    return 'delegate';
  }
  if (toWallet && !fromWallet) {
    if (label.includes('slash') || label.includes('penalty')) {
      return 'penalty';
    }
    return 'recall';
  }
  return 'heartbeat';
};

/**
 * GET /api/onchain/token-restaking-operator-drift/[address]
 * Inspect restaking operator interactions to detect churn and downtime risk.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '60', 10), 365);
    const pageSize = Math.min(parseInt(searchParams.get('limit') || '160', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-restaking-operator-drift:${normalizedAddress}:${
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

    const operatorSnapshots = RESTAKING_OPERATORS.map((operator) => ({
      operator: operator.name,
      operations: 0,
      delegatedUsd: 0,
      recalledUsd: 0,
      penalties: 0,
      lastInteraction: null as string | null,
      lastAction: null as string | null,
      events: [] as Array<{
        txHash: string;
        performedAt: string;
        action: string;
        usd: number;
      }>,
    }));

    transactions.forEach((tx: any) => {
      if (!withinLookback(tx.block_signed_at, cutoff)) {
        return;
      }

      const operatorIdx = RESTAKING_OPERATORS.findIndex((operator) =>
        matchesOperator(operator, tx)
      );

      if (operatorIdx === -1) {
        return;
      }

      const snapshot = operatorSnapshots[operatorIdx];
      const action = classifyAction(tx, normalizedAddress);
      const usdValue = toNumber(tx.value_quote);

      snapshot.operations += 1;
      snapshot.lastInteraction = snapshot.lastInteraction || tx.block_signed_at;
      if (
        snapshot.lastInteraction &&
        new Date(tx.block_signed_at).getTime() > new Date(snapshot.lastInteraction).getTime()
      ) {
        snapshot.lastInteraction = tx.block_signed_at;
      }
      snapshot.lastAction = action;

      if (action === 'delegate') {
        snapshot.delegatedUsd += usdValue;
      } else if (action === 'recall') {
        snapshot.recalledUsd += usdValue;
      } else if (action === 'penalty') {
        snapshot.penalties += 1;
      }

      snapshot.events.push({
        txHash: tx.tx_hash,
        performedAt: tx.block_signed_at,
        action,
        usd: +usdValue.toFixed(2),
      });
    });

    const operatorInsights = operatorSnapshots
      .filter((snapshot) => snapshot.operations > 0)
      .map((snapshot) => {
        const netRestaked = snapshot.delegatedUsd - snapshot.recalledUsd;
        const churnRate = snapshot.delegatedUsd
          ? Math.min(1, snapshot.recalledUsd / snapshot.delegatedUsd)
          : 0;
        const inactivityDays = snapshot.lastInteraction
          ? (Date.now() - new Date(snapshot.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
          : null;

        let driftScore = 100;
        if (churnRate > 0.3) {
          driftScore -= (churnRate - 0.3) * 120;
        }
        if ((inactivityDays || 0) > 30) {
          driftScore -= Math.min(30, ((inactivityDays || 0) - 30) * 1.2);
        }
        if (snapshot.penalties > 0) {
          driftScore -= Math.min(35, snapshot.penalties * 12);
        }
        driftScore = Math.max(5, Math.min(100, driftScore));

        const state =
          driftScore >= 75 ? 'stable' : driftScore >= 55 ? 'watch' : 'drifting';

        return {
          operator: snapshot.operator,
          operations: snapshot.operations,
          delegatedUsd: +snapshot.delegatedUsd.toFixed(2),
          recalledUsd: +snapshot.recalledUsd.toFixed(2),
          netRestakedUsd: +netRestaked.toFixed(2),
          churnRate: +churnRate.toFixed(3),
          penalties: snapshot.penalties,
          inactivityDays: inactivityDays ? +inactivityDays.toFixed(1) : null,
          driftScore: +driftScore.toFixed(2),
          state,
          recentEvents: snapshot.events
            .sort(
              (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
            )
            .slice(0, 10),
        };
      })
      .sort((a, b) => b.delegatedUsd - a.delegatedUsd);

    const totalNetRestaked = operatorInsights.reduce(
      (sum, operator) => sum + operator.netRestakedUsd,
      0
    );

    const responsePayload = {
      address: normalizedAddress,
      chainId: targetChainId,
      lookbackDays,
      operatorsTouched: operatorInsights.length,
      totalNetRestakedUsd: +totalNetRestaked.toFixed(2),
      operators: operatorInsights,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, responsePayload, 60 * 1000);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Restaking operator drift error:', error);
    return NextResponse.json(
      {
        error: 'Failed to compute restaking operator drift',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
