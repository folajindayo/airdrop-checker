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
 * GET /api/onchain/token-erc20-holdings-analyzer/[address]
 * Analyze ERC20 token holdings.
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
    const cacheKey = `onchain-erc20-holdings:${normalizedAddress}:${chainId || '1'}:${limit}`;
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
    const tokenHoldings = new Map<string, { symbol: string | null; totalValue: number }>();

    items.forEach((tx: any) => {
      const logs = tx.log_events || [];
      logs.forEach((log: any) => {
        if (normalize(log.decoded?.name) === 'transfer') {
          const token = normalize(log.sender_address);
          const valueUsd = toNumber(log.quote);
          if (!tokenHoldings.has(token)) {
            tokenHoldings.set(token, {
              symbol: log.sender_contract_ticker_symbol || null,
              totalValue: 0,
            });
          }
          const holding = tokenHoldings.get(token)!;
          holding.totalValue += valueUsd;
        }
      });
    });

    const holdings = Array.from(tokenHoldings.entries())
      .map(([token, data]) => ({
        token,
        symbol: data.symbol,
        totalValueUsd: +data.totalValue.toFixed(2),
      }))
      .sort((a, b) => b.totalValueUsd - a.totalValueUsd)
      .slice(0, 20);

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      uniqueTokens: tokenHoldings.size,
      topHoldings: holdings,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('ERC20 holdings analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze ERC20 holdings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

