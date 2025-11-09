import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface SmartRecommendation {
  address: string;
  recommendations: Array<{
    type: 'action' | 'airdrop' | 'strategy' | 'warning';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: string;
    estimatedCost?: number;
    estimatedImpact?: number;
    timeframe?: string;
  }>;
  insights: {
    currentStrengths: string[];
    currentWeaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  personalizedScore: number;
}

/**
 * POST /api/smart-recommendations
 * Get AI-powered personalized recommendations for airdrop farming
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, includeInsights = true } = body;

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

    // Fetch current eligibility (mock - in production, call actual API)
    const eligibilityResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/airdrop-check/${normalizedAddress}`
    ).catch(() => null);

    let currentScore = 50;
    let airdrops: any[] = [];

    if (eligibilityResponse?.ok) {
      const data = await eligibilityResponse.json();
      currentScore = data.overallScore || 50;
      airdrops = data.airdrops || [];
    }

    // Generate smart recommendations
    const recommendations: SmartRecommendation['recommendations'] = [];

    // High priority actions
    if (currentScore < 40) {
      recommendations.push({
        type: 'action',
        priority: 'high',
        title: 'Start Basic Farming Activities',
        description: 'Your score is low. Begin with fundamental activities to build eligibility.',
        action: 'Swap tokens on Uniswap, bridge to L2, mint an NFT',
        estimatedCost: 20,
        estimatedImpact: 25,
        timeframe: '1-2 days',
      });
    }

    // Airdrop-specific recommendations
    const lowScoreAirdrops = airdrops.filter((a) => a.score < 50);
    if (lowScoreAirdrops.length > 0) {
      const topOpportunity = lowScoreAirdrops.sort(
        (a, b) => b.score - a.score
      )[0];
      recommendations.push({
        type: 'airdrop',
        priority: 'high',
        title: `Focus on ${topOpportunity.project}`,
        description: `You're close to qualifying for ${topOpportunity.project}. Complete remaining criteria.`,
        action: `Check ${topOpportunity.project} criteria and complete missing requirements`,
        estimatedCost: 15,
        estimatedImpact: 15,
        timeframe: '1 day',
      });
    }

    // Strategy recommendations
    if (currentScore >= 60 && currentScore < 80) {
      recommendations.push({
        type: 'strategy',
        priority: 'medium',
        title: 'Optimize for High-Value Airdrops',
        description: 'Focus on confirmed airdrops with high estimated values.',
        action: 'Prioritize activities that improve scores for confirmed airdrops',
        estimatedCost: 30,
        estimatedImpact: 20,
        timeframe: '1 week',
      });
    }

    // Multi-chain recommendations
    const chainsUsed = new Set(airdrops.map((a) => a.chains || []).flat());
    if (chainsUsed.size < 3) {
      recommendations.push({
        type: 'action',
        priority: 'medium',
        title: 'Expand Multi-Chain Presence',
        description: 'Diversify across multiple chains to qualify for more airdrops.',
        action: 'Bridge assets to Base, Arbitrum, and Optimism',
        estimatedCost: 10,
        estimatedImpact: 15,
        timeframe: '2-3 days',
      });
    }

    // Warnings
    if (currentScore > 80) {
      recommendations.push({
        type: 'warning',
        priority: 'low',
        title: 'Maintain Activity',
        description: 'Your score is high. Maintain regular activity to avoid score decay.',
        action: 'Continue periodic interactions with protocols',
        timeframe: 'Ongoing',
      });
    }

    // Generate insights
    const insights = {
      currentStrengths: [] as string[],
      currentWeaknesses: [] as string[],
      opportunities: [] as string[],
      threats: [] as string[],
    };

    if (currentScore >= 70) {
      insights.currentStrengths.push('Strong overall eligibility score');
    }
    if (chainsUsed.size >= 3) {
      insights.currentStrengths.push('Good multi-chain presence');
    }

    if (currentScore < 50) {
      insights.currentWeaknesses.push('Low overall eligibility score');
    }
    if (lowScoreAirdrops.length > 5) {
      insights.currentWeaknesses.push('Many airdrops with low scores');
    }

    const confirmedAirdrops = airdrops.filter((a) => a.status === 'confirmed');
    if (confirmedAirdrops.length > 0) {
      insights.opportunities.push(
        `${confirmedAirdrops.length} confirmed airdrops to focus on`
      );
    }

    if (currentScore < 30) {
      insights.threats.push('Very low score may indicate sybil detection risk');
    }

    // Calculate personalized score (weighted by recommendations)
    const personalizedScore = Math.min(
      100,
      currentScore + recommendations.length * 5
    );

    const result: SmartRecommendation = {
      address: normalizedAddress,
      recommendations: recommendations.slice(0, 10), // Limit to top 10
      insights: includeInsights ? insights : {
        currentStrengths: [],
        currentWeaknesses: [],
        opportunities: [],
        threats: [],
      },
      personalizedScore,
    };

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Smart recommendations API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

