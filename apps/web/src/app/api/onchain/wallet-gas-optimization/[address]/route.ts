import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/wallet-gas-optimization/[address]
 * Analyze wallet gas usage and provide optimization tips
 * Suggests gas-saving strategies
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
    const cacheKey = `onchain-gas-optimization:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChains = chainId
      ? SUPPORTED_CHAINS.filter((c) => c.id === parseInt(chainId))
      : SUPPORTED_CHAINS;

    const optimization: any = {
      address: normalizedAddress,
      totalGasSpent: 0,
      averageGasPerTx: 0,
      recommendations: [] as string[],
      potentialSavings: 0,
      timestamp: Date.now(),
    };

    let totalGas = 0;
    let totalTxs = 0;

    for (const chain of targetChains) {
      try {
        const response = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'page-size': 50,
          }
        );

        if (response.data?.items) {
          response.data.items.forEach((tx: any) => {
            totalGas += parseFloat(tx.gas_spent || '0');
            totalTxs++;
          });
        }
      } catch (error) {
        console.error(`Error analyzing gas on ${chain.name}:`, error);
      }
    }

    if (totalTxs > 0) {
      optimization.totalGasSpent = totalGas;
      optimization.averageGasPerTx = totalGas / totalTxs;
      
      if (optimization.averageGasPerTx > 200000) {
        optimization.recommendations.push('Consider batching transactions');
        optimization.potentialSavings = optimization.totalGasSpent * 0.2;
      }
    }

    cache.set(cacheKey, optimization, 10 * 60 * 1000);

    return NextResponse.json(optimization);
  } catch (error) {
    console.error('Gas optimization error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze gas usage',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

