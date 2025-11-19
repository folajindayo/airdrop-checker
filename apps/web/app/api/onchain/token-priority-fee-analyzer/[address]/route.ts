import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-priority-fee-analyzer/[address]
 * Analyze priority fee patterns in transactions
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
    const cacheKey = `onchain-priority-fee:${normalizedAddress}:${chainId || 'all'}`;
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
      priorityFeeStats: {
        min: 0,
        max: 0,
        avg: 0,
      },
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const transactions = response.data.items;
        const fees: number[] = [];
        
        transactions.forEach((tx: any) => {
          if (tx.gas_price) {
            fees.push(parseFloat(tx.gas_price));
          }
        });
        
        if (fees.length > 0) {
          analysis.priorityFeeStats.min = Math.min(...fees);
          analysis.priorityFeeStats.max = Math.max(...fees);
          analysis.priorityFeeStats.avg = fees.reduce((a, b) => a + b, 0) / fees.length;
        }
      }
    } catch (error) {
      console.error('Error analyzing priority fees:', error);
    }

    cache.set(cacheKey, analysis, 5 * 60 * 1000);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Priority fee analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze priority fee patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






