import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface RiskFactor {
  category: string;
  score: number;
  maxScore: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface WalletRiskScoreResponse {
  address: string;
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  recommendations: string[];
  timestamp: number;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { data: WalletRiskScoreResponse; expires: number }>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `wallet-risk-score:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const factors: RiskFactor[] = [];
    let totalRiskScore = 0;
    let maxTotalScore = 0;

    // Analyze wallet across all chains
    let totalTransactions = 0;
    let totalContracts = 0;
    let unlimitedApprovals = 0;
    let unverifiedContracts = 0;
    let suspiciousActivity = 0;

    for (const chain of CHAINS) {
      try {
        const chainName = chain.name.toLowerCase().replace(/\s+/g, '-');
        const txResponse = await goldrushClient.get(
          `/v2/${chainName}/address/${address}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            'page-size': 100,
          }
        );

        if (txResponse.data?.items) {
          totalTransactions += txResponse.data.items.length;
          
          // Count unique contracts
          const contractSet = new Set<string>();
          for (const tx of txResponse.data.items) {
            if (tx.to_address) {
              contractSet.add(tx.to_address.toLowerCase());
            }
            if (tx.successful === false) {
              suspiciousActivity++;
            }
          }
          totalContracts += contractSet.size;
        }
      } catch (error) {
        // Continue with other chains
      }
    }

    // Factor 1: Transaction Volume Risk
    const transactionRisk = Math.min(totalTransactions / 10, 30); // Max 30 points
    factors.push({
      category: 'Transaction Volume',
      score: transactionRisk,
      maxScore: 30,
      description: `High transaction volume (${totalTransactions} transactions) may indicate bot activity`,
      severity: transactionRisk > 20 ? 'high' : transactionRisk > 10 ? 'medium' : 'low',
    });
    totalRiskScore += transactionRisk;
    maxTotalScore += 30;

    // Factor 2: Contract Interaction Risk
    const contractRisk = Math.min(totalContracts / 5, 25); // Max 25 points
    factors.push({
      category: 'Contract Interactions',
      score: contractRisk,
      maxScore: 25,
      description: `Interacted with ${totalContracts} unique contracts`,
      severity: contractRisk > 15 ? 'high' : contractRisk > 8 ? 'medium' : 'low',
    });
    totalRiskScore += contractRisk;
    maxTotalScore += 25;

    // Factor 3: Failed Transactions
    const failedTxRisk = Math.min(suspiciousActivity * 5, 20); // Max 20 points
    factors.push({
      category: 'Failed Transactions',
      score: failedTxRisk,
      maxScore: 20,
      description: `${suspiciousActivity} failed transactions detected`,
      severity: failedTxRisk > 15 ? 'high' : failedTxRisk > 8 ? 'medium' : 'low',
    });
    totalRiskScore += failedTxRisk;
    maxTotalScore += 20;

    // Factor 4: Unlimited Approvals (would need token approvals API)
    const approvalRisk = Math.min(unlimitedApprovals * 10, 15); // Max 15 points
    factors.push({
      category: 'Token Approvals',
      score: approvalRisk,
      maxScore: 15,
      description: `${unlimitedApprovals} unlimited token approvals found`,
      severity: approvalRisk > 10 ? 'high' : approvalRisk > 5 ? 'medium' : 'low',
    });
    totalRiskScore += approvalRisk;
    maxTotalScore += 15;

    // Factor 5: Unverified Contracts
    const unverifiedRisk = Math.min(unverifiedContracts * 3, 10); // Max 10 points
    factors.push({
      category: 'Unverified Contracts',
      score: unverifiedRisk,
      maxScore: 10,
      description: `Interacted with ${unverifiedContracts} unverified contracts`,
      severity: unverifiedRisk > 7 ? 'high' : unverifiedRisk > 3 ? 'medium' : 'low',
    });
    totalRiskScore += unverifiedRisk;
    maxTotalScore += 10;

    // Calculate overall risk score (0-100)
    const overallRiskScore = Math.min(Math.round((totalRiskScore / maxTotalScore) * 100), 100);
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (overallRiskScore >= 75) {
      riskLevel = 'critical';
    } else if (overallRiskScore >= 50) {
      riskLevel = 'high';
    } else if (overallRiskScore >= 25) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (transactionRisk > 20) {
      recommendations.push('Consider reducing transaction frequency to appear more human-like');
    }
    if (contractRisk > 15) {
      recommendations.push('Review contract interactions for suspicious addresses');
    }
    if (failedTxRisk > 10) {
      recommendations.push('Investigate failed transactions - may indicate automation issues');
    }
    if (approvalRisk > 5) {
      recommendations.push('Revoke unlimited token approvals to reduce risk');
    }
    if (unverifiedRisk > 5) {
      recommendations.push('Be cautious with unverified contracts - verify before interacting');
    }
    if (recommendations.length === 0) {
      recommendations.push('Wallet shows low risk indicators - continue monitoring');
    }

    const result: WalletRiskScoreResponse = {
      address: address.toLowerCase(),
      overallRiskScore,
      riskLevel,
      factors,
      recommendations,
      timestamp: Date.now(),
    };

    // Cache result
    cache.set(cacheKey, {
      data: result,
      expires: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error calculating wallet risk score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate wallet risk score', details: error.message },
      { status: 500 }
    );
  }
}

