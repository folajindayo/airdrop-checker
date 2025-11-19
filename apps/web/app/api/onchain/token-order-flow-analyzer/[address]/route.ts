import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-order-flow-analyzer/[address]
 * Analyze order flow patterns in token transactions
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
    const cacheKey = `onchain-order-flow:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const analysis: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      buyOrders: 0,
      sellOrders: 0,
      orderFlowRatio: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const transactions = response.data.items;
        let buyCount = 0;
        let sellCount = 0;
        
        transactions.forEach((tx: any) => {
          if (tx.value && parseFloat(tx.value) > 0) {
            if (tx.from_address?.toLowerCase() === normalizedAddress) {
              sellCount++;
            } else {
              buyCount++;
            }
          }
        });
        
        analysis.buyOrders = buyCount;
        analysis.sellOrders = sellCount;
        analysis.orderFlowRatio = sellCount > 0 ? buyCount / sellCount : buyCount;
      }
    } catch (error) {
      console.error('Error analyzing order flow:', error);
    }

    cache.set(cacheKey, analysis, 5 * 60 * 1000);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Order flow analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze order flow patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






