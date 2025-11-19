import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-transaction-cost-efficiency/[address]
 * Calculate transaction cost efficiency metrics for token operations
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
    const cacheKey = `onchain-tx-cost-efficiency:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const efficiency: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      averageGasCost: 0,
      costPerTransaction: 0,
      efficiencyScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data && response.data.items) {
        const transactions = response.data.items;
        const totalGas = transactions.reduce((sum: number, tx: any) => 
          sum + (parseFloat(tx.gas_spent || '0') * parseFloat(tx.gas_price || '0')), 0);
        
        efficiency.averageGasCost = totalGas / transactions.length || 0;
        efficiency.costPerTransaction = totalGas / transactions.length || 0;
        efficiency.efficiencyScore = transactions.length > 0 ? 
          Math.max(0, 100 - (efficiency.averageGasCost / 1000000)) : 0;
      }
    } catch (error) {
      console.error('Error calculating cost efficiency:', error);
    }

    cache.set(cacheKey, efficiency, 5 * 60 * 1000);

    return NextResponse.json(efficiency);
  } catch (error) {
    console.error('Transaction cost efficiency error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate transaction cost efficiency',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

