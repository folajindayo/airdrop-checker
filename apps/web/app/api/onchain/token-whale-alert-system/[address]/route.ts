import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-whale-alert-system/[address]
 * Alert system for large whale movements
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
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-whale-alert:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const alert: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      whaleThreshold: 100000,
      recentMovements: [],
      alerts: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 20 }
      );

      if (response.data && response.data.items) {
        const largeTxs = response.data.items.filter(
          (tx: any) => parseFloat(tx.value_quote || '0') > alert.whaleThreshold
        );
        alert.recentMovements = largeTxs.slice(0, 5).map((tx: any) => ({
          txHash: tx.tx_hash,
          value: parseFloat(tx.value_quote || '0'),
          from: tx.from_address,
          to: tx.to_address,
          timestamp: tx.block_signed_at,
        }));
        alert.alerts = largeTxs.length > 0 ? ['Large whale movement detected'] : [];
      }
    } catch (error) {
      console.error('Error monitoring whale movements:', error);
    }

    cache.set(cacheKey, alert, 2 * 60 * 1000);

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Whale alert system error:', error);
    return NextResponse.json(
      {
        error: 'Failed to monitor whale movements',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

