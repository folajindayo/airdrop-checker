import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { findAllProjects } from '@/lib/db/models/project';

interface Recommendation {
  project: string;
  projectId: string;
  status: string;
  currentScore: number;
  potentialScore: number;
  scoreDelta: number;
  missingCriteria: Array<{
    description: string;
    actionable: boolean;
    priority: 'high' | 'medium' | 'low';
    estimatedEffort: string;
  }>;
  recommendationReason: string;
}

/**
 * GET /api/recommendations/[address]
 * Get personalized airdrop recommendations based on current eligibility
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    // Validate address
    if (!isAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Fetch current eligibility
    const baseUrl = request.nextUrl.origin;
    const eligibilityResponse = await fetch(
      `${baseUrl}/api/airdrop-check/${address}`
    );

    if (!eligibilityResponse.ok) {
      throw new Error('Failed to fetch eligibility data');
    }

    const eligibilityData = await eligibilityResponse.json();
    const projects = await findAllProjects();

    // Generate recommendations
    const recommendations: Recommendation[] = [];

    eligibilityData.airdrops.forEach((airdrop: any) => {
      const project = projects.find((p) => p.id === airdrop.projectId);
      if (!project) return;

      // Only recommend if score is between 20-80% (room for improvement)
      if (airdrop.score < 20 || airdrop.score >= 90) return;

      // Don't recommend expired airdrops
      if (airdrop.status === 'expired') return;

      const missingCriteria = airdrop.criteria
        .filter((c: any) => !c.met)
        .map((c: any) => {
          const criteriaCheck = c.check || '';
          
          // Determine if actionable
          const actionable = 
            criteriaCheck.includes('bridge') ||
            criteriaCheck.includes('swap') ||
            criteriaCheck.includes('mint') ||
            criteriaCheck.includes('deposit') ||
            criteriaCheck.includes('stake');

          // Determine priority
          let priority: 'high' | 'medium' | 'low' = 'medium';
          if (airdrop.status === 'confirmed') {
            priority = 'high';
          } else if (airdrop.score > 50) {
            priority = 'high';
          } else if (airdrop.score < 30) {
            priority = 'low';
          }

          // Estimate effort
          let estimatedEffort = 'Medium';
          if (criteriaCheck.includes('>=10') || criteriaCheck.includes('>10')) {
            estimatedEffort = 'High (Multiple transactions)';
          } else if (criteriaCheck.includes('>=1') || criteriaCheck.includes('>0')) {
            estimatedEffort = 'Low (Single transaction)';
          }

          return {
            description: c.description,
            actionable,
            priority,
            estimatedEffort,
          };
        });

      // Calculate potential score if all criteria are met
      const potentialScore = 100;
      const scoreDelta = potentialScore - airdrop.score;

      // Generate recommendation reason
      let reason = '';
      if (airdrop.status === 'confirmed' && airdrop.score >= 50) {
        reason = `High priority! This is a confirmed airdrop and you're already ${airdrop.score}% eligible. Complete remaining criteria to maximize rewards.`;
      } else if (airdrop.status === 'confirmed') {
        reason = `Confirmed airdrop with ${missingCriteria.filter(c => c.actionable).length} actionable steps remaining.`;
      } else if (airdrop.score >= 60) {
        reason = `You're ${airdrop.score}% eligible. Just ${missingCriteria.length} more criteria to maximize your chances.`;
      } else {
        reason = `Potential airdrop opportunity. Complete ${missingCriteria.filter(c => c.actionable).length} actions to improve eligibility.`;
      }

      recommendations.push({
        project: airdrop.project,
        projectId: airdrop.projectId,
        status: airdrop.status,
        currentScore: airdrop.score,
        potentialScore,
        scoreDelta,
        missingCriteria,
        recommendationReason: reason,
      });
    });

    // Sort by priority: confirmed first, then by score delta
    recommendations.sort((a, b) => {
      if (a.status === 'confirmed' && b.status !== 'confirmed') return -1;
      if (a.status !== 'confirmed' && b.status === 'confirmed') return 1;
      return b.scoreDelta - a.scoreDelta;
    });

    // Limit to top 10 recommendations
    const topRecommendations = recommendations.slice(0, 10);

    return NextResponse.json({
      success: true,
      address,
      totalRecommendations: recommendations.length,
      recommendations: topRecommendations,
      summary: {
        highPriority: recommendations.filter((r) =>
          r.missingCriteria.some((c) => c.priority === 'high')
        ).length,
        actionableSteps: recommendations.reduce(
          (sum, r) => sum + r.missingCriteria.filter((c) => c.actionable).length,
          0
        ),
        potentialScoreGain: recommendations.reduce(
          (sum, r) => sum + r.scoreDelta,
          0
        ),
      },
    });
  } catch (error) {
    console.error('Recommendations API error:', error);
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

