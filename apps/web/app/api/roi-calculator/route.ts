import { NextRequest, NextResponse } from 'next/server';
import { fetchAllChainTokenBalances } from '@/lib/goldrush/tokens';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface ROICalculation {
  address: string;
  totalGasSpent: number;
  estimatedAirdropValue: number;
  potentialROI: number;
  roiPercentage: number;
  breakEvenAirdropValue: number;
  airdropBreakdown: Array<{
    projectId: string;
    projectName: string;
    score: number;
    estimatedValue: number;
    probability: number;
    expectedValue: number;
  }>;
  recommendations: string[];
  timestamp: number;
}

// Estimated airdrop values based on historical data (in USD)
const AIRDROP_VALUE_ESTIMATES: Record<string, { min: number; max: number; avg: number }> = {
  zora: { min: 500, max: 2000, avg: 1000 },
  layerzero: { min: 1000, max: 5000, avg: 2500 },
  starknet: { min: 2000, max: 10000, avg: 5000 },
  zksync: { min: 1000, max: 8000, avg: 4000 },
  arbitrum: { min: 1000, max: 5000, avg: 2000 },
  optimism: { min: 500, max: 3000, avg: 1500 },
  base: { min: 500, max: 2000, avg: 1000 },
  blur: { min: 1000, max: 5000, avg: 2500 },
  uniswap: { min: 500, max: 2000, avg: 1000 },
  apecoin: { min: 1000, max: 10000, avg: 5000 },
};

// Probability multipliers based on score
function getProbabilityFromScore(score: number): number {
  if (score >= 90) return 0.9;
  if (score >= 75) return 0.7;
  if (score >= 60) return 0.5;
  if (score >= 40) return 0.3;
  if (score >= 20) return 0.15;
  return 0.05;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, airdrops, gasSpentUSD } = body;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    if (!airdrops || !Array.isArray(airdrops)) {
      return NextResponse.json(
        { error: 'Airdrops array is required' },
        { status: 400 }
      );
    }

    const totalGasSpent = gasSpentUSD || 0;

    // Calculate estimated airdrop value and ROI
    const airdropBreakdown = airdrops.map((airdrop: any) => {
      const estimates = AIRDROP_VALUE_ESTIMATES[airdrop.projectId] || { min: 100, max: 1000, avg: 500 };
      const probability = getProbabilityFromScore(airdrop.score);
      const estimatedValue = estimates.avg;
      const expectedValue = estimatedValue * probability;

      return {
        projectId: airdrop.projectId,
        projectName: airdrop.project || airdrop.projectId,
        score: airdrop.score,
        estimatedValue,
        probability,
        expectedValue,
      };
    });

    const totalEstimatedValue = airdropBreakdown.reduce((sum: number, item: any) => sum + item.estimatedValue, 0);
    const totalExpectedValue = airdropBreakdown.reduce((sum: number, item: any) => sum + item.expectedValue, 0);
    
    const potentialROI = totalExpectedValue - totalGasSpent;
    const roiPercentage = totalGasSpent > 0 ? (potentialROI / totalGasSpent) * 100 : 0;
    const breakEvenAirdropValue = totalGasSpent;

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (roiPercentage < 0) {
      recommendations.push('Your current gas spending exceeds expected airdrop value. Consider focusing on higher-probability airdrops.');
    } else if (roiPercentage < 50) {
      recommendations.push('ROI is positive but low. Focus on improving scores for high-value airdrops.');
    } else if (roiPercentage >= 200) {
      recommendations.push('Excellent ROI potential! Your wallet is well-positioned for multiple airdrops.');
    }

    const topAirdrops = airdropBreakdown
      .sort((a: any, b: any) => b.expectedValue - a.expectedValue)
      .slice(0, 3);
    
    if (topAirdrops.length > 0) {
      recommendations.push(`Focus on: ${topAirdrops.map((a: any) => a.projectName).join(', ')}`);
    }

    const lowScoreAirdrops = airdropBreakdown.filter((a: any) => a.score < 40 && a.estimatedValue > 1000);
    if (lowScoreAirdrops.length > 0) {
      recommendations.push(`High-value opportunities to improve: ${lowScoreAirdrops.map((a: any) => a.projectName).join(', ')}`);
    }

    const response: ROICalculation = {
      address,
      totalGasSpent,
      estimatedAirdropValue: totalEstimatedValue,
      potentialROI,
      roiPercentage,
      breakEvenAirdropValue,
      airdropBreakdown,
      recommendations,
      timestamp: Date.now(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error calculating ROI:', error);
    return NextResponse.json(
      { error: 'Failed to calculate ROI' },
      { status: 500 }
    );
  }
}



