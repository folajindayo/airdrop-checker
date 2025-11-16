import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-transaction-batching/[address]
 * Analyze transaction batching patterns and gas savings
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
    const cacheKey = `onchain-tx-batching:${normalizedAddress}:${chainId || 'all'}`;
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
      batchTransactions: [],
      totalGasSaved: 0,
      batchingEfficiency: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const blockGroups = new Map<number, any[]>();
        response.data.items.forEach((tx: any) => {
          const block = tx.block_number;
          if (!blockGroups.has(block)) {
            blockGroups.set(block, []);
          }
          blockGroups.get(block)!.push(tx);
        });
        
        const batches = Array.from(blockGroups.values()).filter(group => group.length > 1);
        analysis.batchTransactions = batches.map(batch => ({
          block: batch[0].block_number,
          txCount: batch.length,
          totalGas: batch.reduce((sum: number, tx: any) => 
            sum + parseFloat(tx.gas_spent || '0'), 0
          ),
        }));
        
        analysis.batchingEfficiency = batches.length > 0 ? 
          (batches.length / response.data.items.length) * 100 : 0;
      }
    } catch (error) {
      console.error('Error analyzing transaction batching:', error);
    }

    cache.set(cacheKey, analysis, 5 * 60 * 1000);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Transaction batching analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze transaction batching',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

