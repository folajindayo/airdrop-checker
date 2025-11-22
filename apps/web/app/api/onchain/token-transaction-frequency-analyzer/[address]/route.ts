import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const hourOfDay = (timestamp: string) => new Date(timestamp).getUTCHours();

/**
 * GET /api/onchain/token-transaction-frequency-analyzer/[address]
 * Analyze transaction frequency patterns.
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
    const cacheKey = `onchain-tx-frequency:${normalizedAddress}:${chainId || '1'}:${limit}`;
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
    const hourlyCounts = new Array(24).fill(0);

    items.forEach((tx: any) => {
      const hour = hourOfDay(tx.block_signed_at);
      hourlyCounts[hour] += 1;
    });

    const peakHour = hourlyCounts.indexOf(Math.max(...hourlyCounts));
    const avgPerHour = items.length / 24;

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalTransactions: items.length,
      peakHour,
      avgPerHour: +avgPerHour.toFixed(2),
      hourlyDistribution: hourlyCounts.map((count, hour) => ({
        hour,
        count,
        percentage: items.length > 0 ? +((count / items.length) * 100).toFixed(2) : 0,
      })),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Transaction frequency analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze transaction frequency',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

