import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface RiskCalculation {
  address: string;
  totalInvestment: number; // Total gas spent in USD
  potentialReward: number; // Estimated airdrop value in USD
  riskScore: number; // 0-100, higher = riskier
  rewardRiskRatio: number; // reward / risk
  breakEvenProbability: number; // Probability needed to break even
  recommendations: string[];
  riskFactors: {
    sybilRisk: number;
    timingRisk: number;
    concentrationRisk: number;
    gasSpendingRisk: number;
    protocolRisk: number;
  };
  expectedValue: number; // Expected value calculation
  confidenceLevel: 'low' | 'medium' | 'high';
}

/**
 * POST /api/risk-calculator
 * Calculate risk vs reward for airdrop farming
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, totalGasSpentUSD, airdrops, riskFactors } = body;

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const gasSpent = totalGasSpentUSD || 0;
    
    // Calculate potential reward from airdrops
    let potentialReward = 0;
    if (airdrops && Array.isArray(airdrops)) {
      potentialReward = airdrops.reduce((sum: number, airdrop: any) => {
        const estimatedValue = airdrop.estimatedValueUSD || 
                              parseFloat((airdrop.estimatedValue || '0').replace(/[^0-9.]/g, '')) || 
                              0;
        // Weight by score (higher score = higher probability)
        const probability = (airdrop.score || 0) / 100;
        return sum + (estimatedValue * probability);
      }, 0);
    }

    // Use provided risk factors or calculate defaults
    const risks = riskFactors || {
      sybilRisk: 25,
      timingRisk: 30,
      concentrationRisk: 20,
      gasSpendingRisk: 15,
      protocolRisk: 10,
    };

    // Calculate overall risk score (weighted average)
    const overallRiskScore = Math.round(
      risks.sybilRisk * 0.25 +
      risks.timingRisk * 0.25 +
      risks.concentrationRisk * 0.20 +
      risks.gasSpendingRisk * 0.15 +
      risks.protocolRisk * 0.15
    );

    // Calculate reward/risk ratio
    const rewardRiskRatio = gasSpent > 0 ? potentialReward / gasSpent : 0;

    // Calculate break-even probability
    // If we spend $X, we need probability P such that P * reward >= X
    const breakEvenProbability = potentialReward > 0 
      ? Math.min(100, (gasSpent / potentialReward) * 100)
      : 100;

    // Calculate expected value
    // EV = Σ (probability_i * value_i) - cost
    const expectedValue = potentialReward - gasSpent;

    // Determine confidence level
    let confidenceLevel: 'low' | 'medium' | 'high' = 'low';
    if (overallRiskScore < 30 && rewardRiskRatio > 5) {
      confidenceLevel = 'high';
    } else if (overallRiskScore < 50 && rewardRiskRatio > 2) {
      confidenceLevel = 'medium';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (rewardRiskRatio < 2) {
      recommendations.push('Low reward-to-risk ratio. Consider focusing on higher-value airdrops.');
    }
    
    if (breakEvenProbability > 50) {
      recommendations.push(`High break-even probability (${breakEvenProbability.toFixed(1)}%). Consider reducing gas spending or targeting higher-value airdrops.`);
    }
    
    if (overallRiskScore > 70) {
      recommendations.push('High overall risk score. Consider diversifying activity and spreading transactions over time.');
    }
    
    if (risks.sybilRisk > 60) {
      recommendations.push('High sybil detection risk. Reduce repetitive patterns in transactions.');
    }
    
    if (risks.timingRisk > 60) {
      recommendations.push('High timing risk. Spread activity over longer periods.');
    }
    
    if (expectedValue < 0) {
      recommendations.push('Negative expected value. Review your farming strategy.');
    } else if (expectedValue > 0) {
      recommendations.push(`Positive expected value of $${expectedValue.toFixed(2)}. Strategy looks promising.`);
    }

    if (confidenceLevel === 'low') {
      recommendations.push('Low confidence level. Consider improving eligibility scores before investing more.');
    }

    const result: RiskCalculation = {
      address: normalizedAddress,
      totalInvestment: gasSpent,
      potentialReward,
      riskScore: overallRiskScore,
      rewardRiskRatio: Math.round(rewardRiskRatio * 100) / 100,
      breakEvenProbability: Math.round(breakEvenProbability * 100) / 100,
      recommendations,
      riskFactors: risks,
      expectedValue: Math.round(expectedValue * 100) / 100,
      confidenceLevel,
    };

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Risk calculator API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate risk',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



