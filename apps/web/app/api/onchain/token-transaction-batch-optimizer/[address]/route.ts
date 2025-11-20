import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-transaction-batch-optimizer/[address]
 * Optimize transaction batching for gas savings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const txCount = parseInt(searchParams.get('txCount') || '5');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-transaction-batch-optimizer:${normalizedAddress}:${txCount}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const optimizer: any = {
      walletAddress: normalizedAddress,
      chainId: targetChainId,
      txCount,
      individualGasCost: 0,
      batchedGasCost: 0,
      gasSavings: 0,
      recommendations: [],
      timestamp: Date.now(),
    };

    try {
      optimizer.individualGasCost = txCount * 21000;
      optimizer.batchedGasCost = 21000 + (txCount - 1) * 5000;
      optimizer.gasSavings = optimizer.individualGasCost - optimizer.batchedGasCost;
      optimizer.recommendations = [
        `Batching ${txCount} transactions saves ${optimizer.gasSavings} gas`,
        'Use batch transactions for multiple operations',
      ];
    } catch (error) {
      console.error('Error optimizing batch transactions:', error);
    }

    cache.set(cacheKey, optimizer, 10 * 60 * 1000);

    return NextResponse.json(optimizer);
  } catch (error) {
    console.error('Transaction batch optimizer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to optimize batch transactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
