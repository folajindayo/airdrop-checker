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

const analyzeTransferPattern = (items: any[], address: string) => {
  const patterns = {
    incoming: [] as Array<{ token: string; value: number; timestamp: string }>,
    outgoing: [] as Array<{ token: string; value: number; timestamp: string }>,
    frequency: new Map<string, number>(),
  };

  items.forEach((tx: any) => {
    const logs = tx.log_events || [];
    logs.forEach((log: any) => {
      if (normalize(log.decoded?.name) !== 'transfer') return;
      const params = log.decoded?.params as Array<{ name: string; value: string }> | undefined;
      if (!params) return;

      const tokenAddr = normalize(log.sender_address);
      const toParam = params.find((p) => normalize(p.name) === 'to');
      const fromParam = params.find((p) => normalize(p.name) === 'from');
      const valueParam = params.find((p) => normalize(p.name) === 'value');
      const valueUsd = toNumber(log.quote_rate) * toNumber(valueParam?.value || 0) / 1e18;

      if (normalize(toParam?.value) === address) {
        patterns.incoming.push({ token: tokenAddr, value: valueUsd, timestamp: tx.block_signed_at });
        patterns.frequency.set(tokenAddr, (patterns.frequency.get(tokenAddr) || 0) + 1);
      }
      if (normalize(fromParam?.value) === address) {
        patterns.outgoing.push({ token: tokenAddr, value: valueUsd, timestamp: tx.block_signed_at });
        patterns.frequency.set(tokenAddr, (patterns.frequency.get(tokenAddr) || 0) + 1);
      }
    });
  });

  return patterns;
};

/**
 * GET /api/onchain/token-transfer-pattern-analyzer/[address]
 * Analyze token transfer patterns and frequencies.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 300);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-transfer-pattern:${normalizedAddress}:${chainId || '1'}:${limit}`;
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
    const patterns = analyzeTransferPattern(items, normalizedAddress);

    const topTokens = Array.from(patterns.frequency.entries())
      .map(([token, count]) => ({ token, frequency: count }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalIncoming: patterns.incoming.length,
      totalOutgoing: patterns.outgoing.length,
      uniqueTokens: patterns.frequency.size,
      topTokens,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Transfer pattern analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze transfer patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
