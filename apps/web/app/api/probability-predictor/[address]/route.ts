import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface ProbabilityPrediction {
  projectId: string;
  projectName: string;
  probability: number; // 0-100
  confidence: 'high' | 'medium' | 'low';
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }>;
  estimatedValue?: number;
  recommendedActions: string[];
}

interface ProbabilityPredictorData {
  address: string;
  predictions: ProbabilityPrediction[];
  overallProbability: number;
  topOpportunities: ProbabilityPrediction[];
  timestamp: number;
}

// Mock prediction algorithm - in production, this would use ML models
function calculateProbability(
  projectId: string,
  score: number,
  activityLevel: number,
  gasSpent: number
): { probability: number; confidence: 'high' | 'medium' | 'low'; factors: any[] } {
  const factors: Array<{ factor: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }> = [];
  
  let probability = score; // Start with eligibility score
  
  // Activity level impact
  if (activityLevel > 50) {
    probability += 10;
    factors.push({ factor: 'High activity level', impact: 'positive', weight: 10 });
  } else if (activityLevel < 20) {
    probability -= 15;
    factors.push({ factor: 'Low activity level', impact: 'negative', weight: 15 });
  }
  
  // Gas spending impact (shows commitment)
  if (gasSpent > 100) {
    probability += 5;
    factors.push({ factor: 'Significant gas spending', impact: 'positive', weight: 5 });
  }
  
  // Project-specific adjustments
  if (projectId === 'zora' && score > 70) {
    probability += 10;
    factors.push({ factor: 'Strong Zora interaction history', impact: 'positive', weight: 10 });
  }
  
  if (projectId === 'layerzero' && activityLevel > 30) {
    probability += 8;
    factors.push({ factor: 'Cross-chain activity detected', impact: 'positive', weight: 8 });
  }
  
  // Clamp probability between 0 and 100
  probability = Math.max(0, Math.min(100, probability));
  
  // Determine confidence
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (score > 80 && activityLevel > 40) {
    confidence = 'high';
  } else if (score < 40 || activityLevel < 10) {
    confidence = 'low';
  }
  
  return { probability, confidence, factors };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const body = await request.json();
    const { airdrops, activityLevel = 30, gasSpentUSD = 0 } = body;

    if (!isValidAddress(address)) {
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

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `probability-predictor:${normalizedAddress}`;
    const cachedResult = cache.get<ProbabilityPredictorData>(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const predictions: ProbabilityPrediction[] = airdrops.map((airdrop: any) => {
      const { probability, confidence, factors } = calculateProbability(
        airdrop.projectId,
        airdrop.score || 0,
        activityLevel,
        gasSpentUSD
      );

      const estimatedValue = probability > 70 ? 2000 : probability > 50 ? 1000 : 500;

      const recommendedActions: string[] = [];
      if (probability < 50) {
        recommendedActions.push(`Increase interactions with ${airdrop.project || airdrop.projectId} to improve probability`);
      }
      if (activityLevel < 20) {
        recommendedActions.push('Increase overall wallet activity across multiple protocols');
      }
      if (probability > 70) {
        recommendedActions.push('Maintain current activity level - high probability of eligibility');
      }

      return {
        projectId: airdrop.projectId,
        projectName: airdrop.project || airdrop.projectId,
        probability,
        confidence,
        factors,
        estimatedValue,
        recommendedActions,
      };
    });

    // Sort by probability
    predictions.sort((a, b) => b.probability - a.probability);

    const overallProbability = predictions.length > 0
      ? predictions.reduce((sum, p) => sum + p.probability, 0) / predictions.length
      : 0;

    const topOpportunities = predictions
      .filter((p) => p.probability > 50)
      .slice(0, 5);

    const result: ProbabilityPredictorData = {
      address: normalizedAddress,
      predictions,
      overallProbability,
      topOpportunities,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 10 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error predicting probabilities:', error);
    return NextResponse.json(
      { error: 'Failed to predict probabilities' },
      { status: 500 }
    );
  }
}

