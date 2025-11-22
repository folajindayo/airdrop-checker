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
 * GET /api/onchain/token-contract-call-frequency/[address]
 * Analyze frequency of calls to specific contracts.
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
    const cacheKey = `onchain-call-frequency:${normalizedAddress}:${chainId || '1'}:${limit}`;
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
    const contractCalls = new Map<string, number>();

    items.forEach((tx: any) => {
      const contract = normalize(tx.to_address);
      if (contract && contract !== normalizedAddress) {
        contractCalls.set(contract, (contractCalls.get(contract) || 0) + 1);
      }
    });

    const frequency = Array.from(contractCalls.entries())
      .map(([contract, count]) => ({ contract, calls: count }))
      .sort((a, b) => b.calls - a.calls);

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalCalls: items.length,
      uniqueContracts: frequency.length,
      topContracts: frequency.slice(0, 15),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Contract call frequency error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze call frequency',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
