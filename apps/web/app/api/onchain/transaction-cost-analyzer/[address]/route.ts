import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/transaction-cost-analyzer/[address]
 * Analyze transaction costs and gas spending patterns
 * Provides cost optimization recommendations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-tx-cost:${normalizedAddress}:${chainId || 'all'}:${days}`;
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

    const analysis: any = {
      address: normalizedAddress,
      period: `${days} days`,
      totalGasSpent: 0,
      totalCostUSD: 0,
      averageGasPerTx: 0,
      costBreakdown: {
        byChain: {} as Record<string, number>,
        byType: {} as Record<string, number>,
      },
      recommendations: [] as string[],
      timestamp: Date.now(),
    };

    let totalTransactions = 0;
    let totalGas = 0;

    for (const chain of targetChains) {
      try {
        const response = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'page-size': 100,
          }
        );

        if (response.data?.items) {
          const transactions = response.data.items;
          let chainGas = 0;
          let chainCost = 0;

          transactions.forEach((tx: any) => {
            const gasUsed = parseFloat(tx.gas_spent || '0');
            const gasPrice = parseFloat(tx.gas_price || '0');
            const cost = gasUsed * gasPrice / 1e18;
            
            chainGas += gasUsed;
            chainCost += cost;
            totalGas += gasUsed;
            totalTransactions++;
          });

          analysis.costBreakdown.byChain[chain.name] = chainCost;
          analysis.totalCostUSD += chainCost;
        }
      } catch (error) {
        console.error(`Error analyzing costs on ${chain.name}:`, error);
      }
    }

    if (totalTransactions > 0) {
      analysis.averageGasPerTx = totalGas / totalTransactions;
    }

    analysis.totalGasSpent = totalGas;
    analysis.recommendations = generateCostRecommendations(analysis);

    cache.set(cacheKey, analysis, 5 * 60 * 1000);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Transaction cost analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze transaction costs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function generateCostRecommendations(analysis: any): string[] {
  const recommendations: string[] = [];

  if (analysis.averageGasPerTx > 200000) {
    recommendations.push('High gas usage detected - consider optimizing contract calls');
  }
  if (analysis.totalCostUSD > 100) {
    recommendations.push('Significant gas costs - consider batching transactions');
  }

  return recommendations;
}

