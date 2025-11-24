import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/wallet-transaction-pattern/[address]
 * Analyze wallet transaction patterns
 * Identifies trading strategies and behaviors
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
    const cacheKey = `onchain-tx-pattern:${normalizedAddress}:${chainId || 'all'}`;
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

    const pattern: any = {
      address: normalizedAddress,
      strategy: 'unknown',
      frequency: 'low',
      averageValue: 0,
      patterns: [] as string[],
      timestamp: Date.now(),
    };

    let totalTxs = 0;
    let totalValue = 0;

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
          totalTxs += response.data.items.length;
          response.data.items.forEach((tx: any) => {
            totalValue += parseFloat(tx.value_quote || '0');
          });
        }
      } catch (error) {
        console.error(`Error analyzing pattern on ${chain.name}:`, error);
      }
    }

    if (totalTxs > 0) {
      pattern.averageValue = totalValue / totalTxs;
      pattern.frequency = totalTxs > 100 ? 'high' : totalTxs > 20 ? 'medium' : 'low';
      
      if (pattern.averageValue > 100000) pattern.strategy = 'whale';
      else if (totalTxs > 50) pattern.strategy = 'trader';
      else pattern.strategy = 'holder';
    }

    cache.set(cacheKey, pattern, 5 * 60 * 1000);

    return NextResponse.json(pattern);
  } catch (error) {
    console.error('Transaction pattern analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze transaction patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

