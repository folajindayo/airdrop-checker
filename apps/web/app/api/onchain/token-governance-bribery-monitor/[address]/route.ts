import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-governance-bribery-monitor/[address]
 * Monitor governance bribery markets and incentives
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-governance-bribery-monitor:${normalizedAddress}:${chainId || 'all'}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const bribery: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      activeMarkets: [],
      avgBribeAPR: 0,
      lastParticipation: null,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v1/${targetChainId}/address/${normalizedAddress}/transactions_v3/`,
        { 'page-size': 50 }
      );

      if (response.data && response.data.items) {
        const bribeTxs = response.data.items.filter((tx: any) =>
          (tx.successful === true) && ((tx.raw_log || '').toLowerCase().includes('bribe') ||
            (tx.events || []).some((evt: any) => (evt.raw_log_data || '').toLowerCase().includes('bribe')))
        );
        bribery.activeMarkets = bribeTxs.slice(0, 5).map((tx: any) => ({
          txHash: tx.tx_hash,
          protocol: tx.to_address_label || 'unknown',
          valueUsd: tx.value_quote,
        }));
        bribery.avgBribeAPR = Math.min(200, bribeTxs.length * 5);
        bribery.lastParticipation = bribeTxs[0]?.block_signed_at || null;
      }
    } catch (error) {
      console.error('Governance bribery fetch error:', error);
    }

    cache.set(cacheKey, bribery, 5 * 60 * 1000);

    return NextResponse.json(bribery);
  } catch (error) {
    console.error('Governance bribery monitor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to monitor governance bribery markets',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
