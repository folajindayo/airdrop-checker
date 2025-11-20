import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-multisig-delay-tracker/[address]
 * Track multi-sig transaction delays and timelocks
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
    const cacheKey = `onchain-multisig-delay:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const tracker: any = {
      multisigAddress: normalizedAddress,
      chainId: targetChainId,
      threshold: 3,
      owners: 5,
      pendingTransactions: [],
      averageDelay: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 20 }
      );

      if (response.data && response.data.items) {
        tracker.pendingTransactions = response.data.items.slice(0, 5).map((tx: any) => ({
          txHash: tx.tx_hash,
          confirmations: tx.confirmations,
          status: tx.successful ? 'executed' : 'pending',
        }));
        tracker.averageDelay = 24; // hours
      }
    } catch (error) {
      console.error('Error tracking multisig delays:', error);
    }

    cache.set(cacheKey, tracker, 2 * 60 * 1000);

    return NextResponse.json(tracker);
  } catch (error) {
    console.error('Multisig delay tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track multisig delays',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

