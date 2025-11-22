import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const normalize = (value?: string | null) => (value || '').toLowerCase();

/**
 * GET /api/onchain/token-token-approval-tracker/[address]
 * Track token approval events.
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
    const cacheKey = `onchain-approval-tracker:${normalizedAddress}:${chainId || '1'}:${limit}`;
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
    const approvals = new Map<string, number>();

    items.forEach((tx: any) => {
      const logs = tx.log_events || [];
      logs.forEach((log: any) => {
        if (normalize(log.decoded?.name) === 'approval') {
          const token = normalize(log.sender_address);
          approvals.set(token, (approvals.get(token) || 0) + 1);
        }
      });
    });

    const approvalList = Array.from(approvals.entries())
      .map(([token, count]) => ({ token, approvals: count }))
      .sort((a, b) => b.approvals - a.approvals);

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalApprovals: Array.from(approvals.values()).reduce((sum, c) => sum + c, 0),
      uniqueTokens: approvals.size,
      tokenApprovals: approvalList,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Token approval tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track token approvals',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

