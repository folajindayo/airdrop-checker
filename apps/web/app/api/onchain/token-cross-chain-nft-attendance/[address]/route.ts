import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress, SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const NFT_HINTS = ['poap', 'badge', 'event', 'attendance', 'passport'];
const TARGET_CHAINS = [1, 10, 137, 8453, 42161];

const normalize = (value?: string | null) => (value || '').toLowerCase();
const toNumber = (value?: string | number | null) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const looksAttendance = (log: any) => {
  const symbol = normalize(log.sender_contract_ticker_symbol);
  const name = normalize(log.sender_name);
  const label = `${symbol} ${name}`;
  return NFT_HINTS.some((hint) => label.includes(hint));
};

/**
 * GET /api/onchain/token-cross-chain-nft-attendance/[address]
 * Track NFT attendance badges across Ethereum, Optimism, Base, Arbitrum, Polygon.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '120', 10), 365);
    const limit = Math.min(parseInt(searchParams.get('limit') || '120', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-cross-chain-nft-attendance:${normalizedAddress}:${lookbackDays}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
    const chains = SUPPORTED_CHAINS.filter((chain) => TARGET_CHAINS.includes(chain.id));

    const attendance: Array<{
      chainId: number;
      chainName: string;
      contract: string;
      tokenId: string | null;
      receivedAt: string;
      symbol: string | null;
      txHash: string;
    }> = [];

    for (const chain of chains) {
      try {
        const response = await goldrushClient.get<{
          data?: { items?: any[] };
        }>(`/v1/${chain.id}/address/${normalizedAddress}/transactions_v3/`, {
          'page-size': limit,
          'with-logs': true,
        });
        const items = response?.data?.items || [];
        items.forEach((tx) => {
          const blockMs = new Date(tx.block_signed_at).getTime();
          if (blockMs < cutoff) {
            return;
          }
          const relevantLogs = (tx.log_events || []).filter((log: any) => {
            if (normalize(log.decoded?.name) !== 'transfer') {
              return false;
            }
            const toParam = log.decoded?.params?.find((p: any) => normalize(p.name) === 'to');
            if (normalize(toParam?.value) !== normalizedAddress) {
              return false;
            }
            return looksAttendance(log);
          });
          relevantLogs.forEach((log: any) => {
            const tokenIdParam = log.decoded?.params?.find((p: any) => normalize(p.name) === 'tokenid');
            attendance.push({
              chainId: chain.id,
              chainName: chain.name,
              contract: log.sender_address || tx.to_address || 'unknown',
              tokenId: tokenIdParam?.value?.toString?.() || null,
              receivedAt: tx.block_signed_at,
              symbol: log.sender_contract_ticker_symbol || null,
              txHash: tx.tx_hash,
            });
          });
        });
      } catch (error) {
        console.error(`NFT attendance fetch failed on chain ${chain.id}:`, error);
      }
    }

    if (!attendance.length) {
      const emptyPayload = {
        address: normalizedAddress,
        lookbackDays,
        badges: 0,
        chainsCovered: 0,
        breakdown: [],
        recent: [],
        timestamp: Date.now(),
      } as const;
      cache.set(cacheKey, emptyPayload, 60 * 1000);
      return NextResponse.json(emptyPayload);
    }

    const breakdown = attendance.reduce<Record<string, number>>((acc, badge) => {
      acc[badge.chainName] = (acc[badge.chainName] || 0) + 1;
      return acc;
    }, {});

    const payload = {
      address: normalizedAddress,
      lookbackDays,
      badges: attendance.length,
      chainsCovered: Object.keys(breakdown).length,
      breakdown: Object.entries(breakdown).map(([chainName, count]) => ({ chainName, count })),
      recent: attendance
        .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
        .slice(0, 15),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Cross-chain NFT attendance error:', error);
    return NextResponse.json(
      {
        error: 'Failed to build cross-chain NFT attendance tracker',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
