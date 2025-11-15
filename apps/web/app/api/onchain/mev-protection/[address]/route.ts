import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/mev-protection/[address]
 * Check MEV protection status for wallet transactions
 * Analyzes transaction patterns for front-running protection
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
    const cacheKey = `onchain-mev-protection:${normalizedAddress}:${chainId || 'all'}:${days}`;
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
      protectionScore: 0,
      risks: [] as string[],
      recommendations: [] as string[],
      transactionAnalysis: {
        totalTransactions: 0,
        protectedTransactions: 0,
        unprotectedTransactions: 0,
        averageGasPrice: 0,
        maxPriorityFee: 0,
      },
      byChain: {} as Record<string, any>,
      timestamp: Date.now(),
    };

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
          const chainAnalysis = analyzeTransactions(transactions, chain.id);

          analysis.transactionAnalysis.totalTransactions += chainAnalysis.total;
          analysis.transactionAnalysis.protectedTransactions += chainAnalysis.protected;
          analysis.transactionAnalysis.unprotectedTransactions += chainAnalysis.unprotected;
          analysis.byChain[chain.name] = chainAnalysis;
        }
      } catch (error) {
        console.error(`Error analyzing MEV protection on ${chain.name}:`, error);
      }
    }

    analysis.protectionScore = calculateProtectionScore(analysis);
    analysis.risks = identifyRisks(analysis);
    analysis.recommendations = generateRecommendations(analysis);

    cache.set(cacheKey, analysis, 5 * 60 * 1000);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('MEV protection analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze MEV protection',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function analyzeTransactions(transactions: any[], chainId: number) {
  let protected = 0;
  let unprotected = 0;
  let totalGasPrice = 0;

  transactions.forEach((tx: any) => {
    const hasPrivatePool = tx.to_address_label?.toLowerCase().includes('flashbots') ||
                          tx.to_address_label?.toLowerCase().includes('private');
    const hasHighPriorityFee = tx.max_priority_fee_per_gas && 
                               parseFloat(tx.max_priority_fee_per_gas) > 2e9;
    const isProtected = hasPrivatePool || hasHighPriorityFee;

    if (isProtected) {
      protected++;
    } else {
      unprotected++;
    }

    if (tx.gas_price) {
      totalGasPrice += parseFloat(tx.gas_price);
    }
  });

  return {
    total: transactions.length,
    protected,
    unprotected,
    averageGasPrice: transactions.length > 0 ? totalGasPrice / transactions.length : 0,
    protectionRate: transactions.length > 0 ? (protected / transactions.length) * 100 : 0,
  };
}

function calculateProtectionScore(analysis: any): number {
  const total = analysis.transactionAnalysis.totalTransactions;
  if (total === 0) return 0;

  const protected = analysis.transactionAnalysis.protectedTransactions;
  const protectionRate = (protected / total) * 100;

  return Math.round(protectionRate);
}

function identifyRisks(analysis: any): string[] {
  const risks: string[] = [];
  const protectionRate = analysis.transactionAnalysis.totalTransactions > 0
    ? (analysis.transactionAnalysis.protectedTransactions / 
       analysis.transactionAnalysis.totalTransactions) * 100
    : 0;

  if (protectionRate < 50) {
    risks.push('Low MEV protection - Most transactions are unprotected');
  }
  if (analysis.transactionAnalysis.averageGasPrice < 1e9) {
    risks.push('Low gas prices may indicate vulnerability to front-running');
  }

  return risks;
}

function generateRecommendations(analysis: any): string[] {
  const recommendations: string[] = [];

  if (analysis.protectionScore < 70) {
    recommendations.push('Consider using private transaction pools like Flashbots');
    recommendations.push('Use higher priority fees for sensitive transactions');
    recommendations.push('Enable MEV protection in your Reown wallet settings');
  }

  return recommendations;
}

