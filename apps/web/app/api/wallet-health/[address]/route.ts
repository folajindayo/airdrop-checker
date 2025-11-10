import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface HealthMetric {
  category: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  details: string[];
}

interface WalletHealthData {
  address: string;
  overallScore: number;
  metrics: HealthMetric[];
  riskFactors: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendations: string[];
  timestamp: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `wallet-health:${normalizedAddress}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const metrics: HealthMetric[] = [];
    const riskFactors: WalletHealthData['riskFactors'] = [];
    const recommendations: string[] = [];

    // Analyze activity across chains
    let totalTransactions = 0;
    let uniqueContracts = new Set<string>();
    let highValueTransactions = 0;
    let suspiciousPatterns = 0;
    const chainActivity = new Map<number, number>();

    for (const chain of SUPPORTED_CHAINS) {
      try {
        const txResponse = await goldrushClient.get(
          `/${chain.goldrushName}/address/${normalizedAddress}/transactions_v2/`,
          { 'page-size': 50 }
        );

        if (txResponse.data?.items) {
          const txs = txResponse.data.items;
          totalTransactions += txs.length;
          chainActivity.set(chain.id, txs.length);

          txs.forEach((tx: any) => {
            if (tx.to_address) {
              uniqueContracts.add(tx.to_address.toLowerCase());
            }
            if (tx.value_quote && tx.value_quote > 10000) {
              highValueTransactions++;
            }
            // Detect suspicious patterns
            if (tx.gas_price && tx.gas_price > 200) {
              suspiciousPatterns++;
            }
          });
        }
      } catch (error) {
        console.error(`Error analyzing ${chain.name}:`, error);
      }
    }

    // Activity Score (0-25)
    const activityScore = Math.min(25, Math.floor(totalTransactions / 10));
    const activityStatus = activityScore >= 20 ? 'excellent' : 
                          activityScore >= 15 ? 'good' : 
                          activityScore >= 10 ? 'warning' : 'critical';
    metrics.push({
      category: 'Activity',
      score: activityScore,
      maxScore: 25,
      status: activityStatus,
      details: [
        `${totalTransactions} total transactions`,
        `${uniqueContracts.size} unique contracts`,
        `${chainActivity.size} chains used`,
      ],
    });

    // Diversification Score (0-20)
    const diversificationScore = Math.min(20, uniqueContracts.size * 2);
    const diversificationStatus = diversificationScore >= 15 ? 'excellent' :
                                  diversificationScore >= 10 ? 'good' :
                                  diversificationScore >= 5 ? 'warning' : 'critical';
    metrics.push({
      category: 'Diversification',
      score: diversificationScore,
      maxScore: 20,
      status: diversificationStatus,
      details: [
        `Interacted with ${uniqueContracts.size} unique contracts`,
        `Active on ${chainActivity.size} chains`,
      ],
    });

    // Security Score (0-25)
    let securityScore = 25;
    if (suspiciousPatterns > totalTransactions * 0.1) {
      securityScore -= 10;
      riskFactors.push({
        type: 'High Gas Usage',
        severity: 'medium',
        description: `${suspiciousPatterns} transactions with unusually high gas prices`,
      });
    }
    if (highValueTransactions > 0 && highValueTransactions < totalTransactions * 0.05) {
      securityScore -= 5;
    }
    const securityStatus = securityScore >= 20 ? 'excellent' :
                          securityScore >= 15 ? 'good' :
                          securityScore >= 10 ? 'warning' : 'critical';
    metrics.push({
      category: 'Security',
      score: Math.max(0, securityScore),
      maxScore: 25,
      status: securityStatus,
      details: [
        suspiciousPatterns > 0 ? `${suspiciousPatterns} high gas transactions` : 'Normal gas usage',
        highValueTransactions > 0 ? `${highValueTransactions} high-value transactions` : 'No high-value transactions',
      ],
    });

    // Consistency Score (0-15)
    const activeChains = chainActivity.size;
    const consistencyScore = Math.min(15, activeChains * 3);
    const consistencyStatus = consistencyScore >= 12 ? 'excellent' :
                              consistencyScore >= 8 ? 'good' :
                              consistencyScore >= 5 ? 'warning' : 'critical';
    metrics.push({
      category: 'Consistency',
      score: consistencyScore,
      maxScore: 15,
      status: consistencyStatus,
      details: [
        `Active on ${activeChains} chains`,
        'Multi-chain activity improves airdrop eligibility',
      ],
    });

    // Engagement Score (0-15)
    const avgTransactionsPerChain = totalTransactions / Math.max(chainActivity.size, 1);
    const engagementScore = Math.min(15, Math.floor(avgTransactionsPerChain / 2));
    const engagementStatus = engagementScore >= 12 ? 'excellent' :
                            engagementScore >= 8 ? 'good' :
                            engagementScore >= 5 ? 'warning' : 'critical';
    metrics.push({
      category: 'Engagement',
      score: engagementScore,
      maxScore: 15,
      status: engagementStatus,
      details: [
        `${avgTransactionsPerChain.toFixed(1)} avg transactions per chain`,
        totalTransactions > 50 ? 'High engagement level' : 'Moderate engagement',
      ],
    });

    // Calculate overall score
    const overallScore = metrics.reduce((sum, m) => sum + m.score, 0);

    // Generate recommendations
    if (activityScore < 15) {
      recommendations.push('Increase your transaction activity to improve airdrop eligibility');
    }
    if (diversificationScore < 10) {
      recommendations.push('Interact with more protocols and contracts for better diversification');
    }
    if (activeChains < 3) {
      recommendations.push('Expand to more chains (Base, Arbitrum, Optimism) for better coverage');
    }
    if (securityScore < 20) {
      recommendations.push('Review high gas transactions and consider optimizing gas usage');
    }
    if (overallScore < 60) {
      recommendations.push('Focus on consistent activity across multiple protocols and chains');
    }

    const result: WalletHealthData = {
      address: normalizedAddress,
      overallScore,
      metrics,
      riskFactors,
      recommendations,
      timestamp: Date.now(),
    };

    // Cache for 10 minutes
    cache.set(cacheKey, result, 10 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing wallet health:', error);
    return NextResponse.json(
      { error: 'Failed to analyze wallet health' },
      { status: 500 }
    );
  }
}

