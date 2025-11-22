import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
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

/**
 * GET /api/onchain/token-holder-concentration-analyzer/[address]
 * Analyze token holder concentration and distribution patterns.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '150', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-holder-concentration:${normalizedAddress}:${chainId || '1'}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId, 10) : 1;
    const response = await goldrushClient.get<{
      data?: { items?: any[] };
    }>(`/v1/${targetChainId}/address/${normalizedAddress}/transactions_v3/`, {
      'page-size': limit,
      'with-logs': true,
    });

    const items = response?.data?.items || [];
    const tokenHoldings = new Map<string, {
      symbol: string | null;
      totalIn: number;
      totalOut: number;
      holders: Set<string>;
    }>();

    items.forEach((tx: any) => {
      const logs = tx.log_events || [];
      logs.forEach((log: any) => {
        if (normalize(log.decoded?.name) !== 'transfer') return;
        const params = log.decoded?.params as Array<{ name: string; value: string }> | undefined;
        if (!params) return;

        const tokenAddr = normalize(log.sender_address);
        const toParam = params.find((p) => normalize(p.name) === 'to');
        const fromParam = params.find((p) => normalize(p.name) === 'from');
        const valueUsd = toNumber(log.quote_rate) * toNumber(log.quote);

        if (!tokenHoldings.has(tokenAddr)) {
          tokenHoldings.set(tokenAddr, {
            symbol: log.sender_contract_ticker_symbol || null,
            totalIn: 0,
            totalOut: 0,
            holders: new Set(),
          });
        }

        const stats = tokenHoldings.get(tokenAddr)!;
        if (normalize(toParam?.value) === normalizedAddress) {
          stats.totalIn += valueUsd;
          stats.holders.add(normalize(fromParam?.value || ''));
        }
        if (normalize(fromParam?.value) === normalizedAddress) {
          stats.totalOut += valueUsd;
          stats.holders.add(normalize(toParam?.value || ''));
        }
      });
    });

    const analysis = Array.from(tokenHoldings.entries()).map(([tokenAddr, stats]) => {
      const concentration = stats.holders.size > 0 ? 100 / stats.holders.size : 100;
      return {
        tokenAddress: tokenAddr,
        symbol: stats.symbol,
        uniqueHolders: stats.holders.size,
        concentrationScore: +concentration.toFixed(2),
        totalInflowUsd: +stats.totalIn.toFixed(2),
        totalOutflowUsd: +stats.totalOut.toFixed(2),
      };
    }).sort((a, b) => b.concentrationScore - a.concentrationScore);

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      tokensAnalyzed: analysis.length,
      avgConcentration: analysis.length
        ? +(analysis.reduce((sum, t) => sum + t.concentrationScore, 0) / analysis.length).toFixed(2)
        : 0,
      topConcentrated: analysis.slice(0, 10),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Token holder concentration error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze holder concentration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
