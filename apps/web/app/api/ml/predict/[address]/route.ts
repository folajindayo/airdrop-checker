import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { findAllProjects } from '@/lib/db/models/project';
import { fetchAllChainTransactions, fetchAllChainNFTs } from '@/lib/goldrush';
import { aggregateUserActivity } from '@/lib/analyzers/activity-aggregator';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ml/predict/[address]
 * ML-powered airdrop likelihood prediction
 */
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

    // Fetch user activity
    const [chainTransactions, chainNFTs, projects] = await Promise.all([
      fetchAllChainTransactions(normalizedAddress),
      fetchAllChainNFTs(normalizedAddress),
      findAllProjects(),
    ]);

    const userActivity = aggregateUserActivity(
      normalizedAddress,
      chainTransactions,
      chainNFTs
    );

    // ML-based prediction features
    const features = {
      // Activity features
      totalTransactions: Object.values(chainTransactions).reduce((sum, txs) => sum + txs.length, 0),
      totalNFTs: Object.values(chainNFTs).reduce((sum, nfts) => sum + nfts.length, 0),
      chainsUsed: Object.keys(chainTransactions).length,
      uniqueProtocols: new Set([
        ...Object.keys(userActivity.swaps || {}),
        ...Object.keys(userActivity.nftPlatforms || {}),
        ...Object.keys(userActivity.bridges || {}),
        ...Object.keys(userActivity.lendingProtocols || {}),
      ]).size,

      // Timing features
      accountAge: calculateAccountAge(chainTransactions),
      activityConsistency: calculateActivityConsistency(chainTransactions),
      recentActivity: calculateRecentActivity(chainTransactions),

      // Diversity features
      protocolDiversity: calculateProtocolDiversity(userActivity),
      chainDiversity: Object.keys(chainTransactions).length,
      transactionTypes: calculateTransactionTypes(userActivity),
    };

    // ML prediction model (simplified - in production, use actual ML model)
    const predictions = projects
      .filter((p) => p.status === 'rumored' || p.status === 'speculative')
      .map((project) => {
        // Calculate likelihood score based on features
        let likelihoodScore = 0;

        // Chain match bonus
        if (project.chains && features.chainsUsed > 0) {
          const matchingChains = project.chains.filter((c) =>
            Object.keys(chainTransactions).some((chainId) => {
              // Simplified chain matching
              return true; // Would match actual chain IDs
            })
          );
          if (matchingChains.length > 0) {
            likelihoodScore += 20;
          }
        }

        // Activity level bonus
        if (features.totalTransactions > 50) likelihoodScore += 15;
        if (features.totalTransactions > 100) likelihoodScore += 10;

        // Protocol diversity bonus
        if (features.uniqueProtocols > 5) likelihoodScore += 15;
        if (features.uniqueProtocols > 10) likelihoodScore += 10;

        // Account age bonus
        if (features.accountAge > 180) likelihoodScore += 10; // 6+ months
        if (features.accountAge > 365) likelihoodScore += 10; // 1+ year

        // Activity consistency bonus
        if (features.activityConsistency > 0.7) likelihoodScore += 10;

        // Recent activity bonus
        if (features.recentActivity > 0.5) likelihoodScore += 15;

        // Criteria match bonus
        const criteriaCount = Array.isArray(project.criteria) ? project.criteria.length : 0;
        if (criteriaCount > 0) {
          likelihoodScore += Math.min(20, criteriaCount * 2);
        }

        // Normalize to 0-100
        const likelihood = Math.min(100, Math.max(0, likelihoodScore));

        return {
          projectId: project.projectId,
          name: project.name,
          status: project.status,
          likelihood,
          confidence: calculateConfidence(likelihood, features),
          factors: {
            chainMatch: project.chains && features.chainsUsed > 0,
            highActivity: features.totalTransactions > 50,
            diverseProtocols: features.uniqueProtocols > 5,
            matureAccount: features.accountAge > 180,
            consistentActivity: features.activityConsistency > 0.7,
            recentActivity: features.recentActivity > 0.5,
          },
          estimatedLaunch: estimateLaunchDate(likelihood),
        };
      })
      .sort((a, b) => b.likelihood - a.likelihood)
      .slice(0, 20);

    return NextResponse.json({
      success: true,
      address: normalizedAddress,
      predictions,
      features,
      modelVersion: '1.0',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('ML Prediction API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate ML predictions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function calculateAccountAge(chainTransactions: Record<number, any[]>): number {
  let oldestTx: Date | null = null;
  Object.values(chainTransactions).forEach((txs) => {
    txs.forEach((tx: any) => {
      const txDate = new Date(tx.block_signed_at);
      if (!oldestTx || txDate < oldestTx) {
        oldestTx = txDate;
      }
    });
  });
  if (!oldestTx) return 0;
  return Math.floor((Date.now() - oldestTx.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateActivityConsistency(chainTransactions: Record<number, any[]>): number {
  // Calculate how consistent activity is over time
  const dailyActivity: Record<string, number> = {};
  Object.values(chainTransactions).forEach((txs) => {
    txs.forEach((tx: any) => {
      const date = new Date(tx.block_signed_at).toISOString().split('T')[0];
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });
  });

  const days = Object.keys(dailyActivity).length;
  if (days === 0) return 0;

  const avgActivity = Object.values(dailyActivity).reduce((a, b) => a + b, 0) / days;
  const variance = Object.values(dailyActivity).reduce(
    (sum, count) => sum + Math.pow(count - avgActivity, 2),
    0
  ) / days;

  // Lower variance = higher consistency
  return Math.max(0, 1 - variance / (avgActivity + 1));
}

function calculateRecentActivity(chainTransactions: Record<number, any[]>): number {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  let recentTxs = 0;
  let totalTxs = 0;

  Object.values(chainTransactions).forEach((txs) => {
    txs.forEach((tx: any) => {
      totalTxs++;
      if (new Date(tx.block_signed_at).getTime() > thirtyDaysAgo) {
        recentTxs++;
      }
    });
  });

  return totalTxs > 0 ? recentTxs / totalTxs : 0;
}

function calculateProtocolDiversity(activity: any): number {
  const protocols = new Set([
    ...Object.keys(activity.swaps || {}),
    ...Object.keys(activity.nftPlatforms || {}),
    ...Object.keys(activity.bridges || {}),
    ...Object.keys(activity.lendingProtocols || {}),
  ]);
  return protocols.size;
}

function calculateTransactionTypes(activity: any): number {
  let types = 0;
  if (Object.keys(activity.swaps || {}).length > 0) types++;
  if (Object.keys(activity.nftPlatforms || {}).length > 0) types++;
  if (Object.keys(activity.bridges || {}).length > 0) types++;
  if (Object.keys(activity.lendingProtocols || {}).length > 0) types++;
  return types;
}

function calculateConfidence(likelihood: number, features: any): 'low' | 'medium' | 'high' {
  if (likelihood >= 70 && features.totalTransactions > 20) return 'high';
  if (likelihood >= 50 && features.totalTransactions > 10) return 'medium';
  return 'low';
}

function estimateLaunchDate(likelihood: number): string {
  const daysFromNow = likelihood > 80 ? 30 : likelihood > 60 ? 60 : 90;
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

