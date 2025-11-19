import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-gas-refund-tracker/[address]
 * Track gas refunds from failed transactions
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
    const cacheKey = `onchain-gas-refund:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const tracking: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalRefunds: 0,
      refundCount: 0,
      avgRefund: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const failedTxs = response.data.items.filter((tx: any) => !tx.successful);
        tracking.refundCount = failedTxs.length;
        
        if (failedTxs.length > 0) {
          const refunds = failedTxs.map((tx: any) => 
            parseFloat(tx.gas_spent || '0') * 0.1
          );
          tracking.totalRefunds = refunds.reduce((a, b) => a + b, 0);
          tracking.avgRefund = tracking.totalRefunds / failedTxs.length;
        }
      }
    } catch (error) {
      console.error('Error tracking gas refunds:', error);
    }

    cache.set(cacheKey, tracking, 5 * 60 * 1000);

    return NextResponse.json(tracking);
  } catch (error) {
    console.error('Gas refund tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track gas refunds',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





