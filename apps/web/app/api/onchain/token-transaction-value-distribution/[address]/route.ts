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

const categorizeValue = (value: number) => {
  if (value < 10) return 'micro';
  if (value < 100) return 'small';
  if (value < 1000) return 'medium';
  if (value < 10000) return 'large';
  return 'whale';
};

/**
 * GET /api/onchain/token-transaction-value-distribution/[address]
 * Analyze distribution of transaction values.
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
    const cacheKey = `onchain-value-distribution:${normalizedAddress}:${chainId || '1'}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId, 10) : 1;
    const response = await goldrushClient.get<{
      data?: { items?: any[] };
    }>(`/v1/${targetChainId}/address/${normalizedAddress}/transactions_v3/`, {
      'page-size': limit,
    });

    const items = response?.data?.items || [];
    const distribution = {
      micro: 0,
      small: 0,
      medium: 0,
      large: 0,
      whale: 0,
    };

    items.forEach((tx: any) => {
      const value = toNumber(tx.value_quote);
      const category = categorizeValue(value);
      distribution[category as keyof typeof distribution] += 1;
    });

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalTransactions: items.length,
      distribution,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Transaction value distribution error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze value distribution',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
