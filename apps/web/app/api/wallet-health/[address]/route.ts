import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const healthData = generateMockHealthData(address);

    return NextResponse.json(healthData);
  } catch (error) {
    console.error('Wallet health API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet health data' },
      { status: 500 }
    );
  }
}

<<<<<<< HEAD
function generateMockHealthData(address: string) {
  // Calculate individual metric scores
  const activityScore = Math.floor(Math.random() * 30) + 70; // 70-100
  const securityScore = Math.floor(Math.random() * 30) + 65; // 65-95
  const diversityScore = Math.floor(Math.random() * 35) + 60; // 60-95
  const defiScore = Math.floor(Math.random() * 40) + 55; // 55-95
  const nftScore = Math.floor(Math.random() * 40) + 50; // 50-90
  const airdropScore = Math.floor(Math.random() * 35) + 60; // 60-95

  const metrics = [
    {
      category: 'Activity Level',
      score: activityScore,
      maxScore: 100,
      status: getStatus(activityScore),
      details: 'Regular transactions and protocol interactions',
      recommendations: [
        'Maintain consistent weekly activity',
        'Interact with at least 3 protocols per week',
        'Diversify transaction types',
      ],
    },
    {
      category: 'Security',
      score: securityScore,
      maxScore: 100,
      status: getStatus(securityScore),
      details: 'Token approvals and risk management',
      recommendations: [
        'Review and revoke unused token approvals',
        'Use hardware wallet for large holdings',
        'Enable transaction monitoring',
      ],
    },
    {
      category: 'Portfolio Diversity',
      score: diversityScore,
      maxScore: 100,
      status: getStatus(diversityScore),
      details: 'Asset allocation and chain distribution',
      recommendations: [
        'Spread assets across multiple chains',
        'Hold a mix of tokens and stablecoins',
        'Consider blue-chip DeFi tokens',
      ],
    },
    {
      category: 'DeFi Participation',
      score: defiScore,
      maxScore: 100,
      status: getStatus(defiScore),
      details: 'Lending, staking, and liquidity provision',
      recommendations: [
        'Provide liquidity on major DEXes',
        'Stake tokens in governance protocols',
        'Use lending protocols for passive income',
      ],
    },
    {
      category: 'NFT Activity',
      score: nftScore,
      maxScore: 100,
      status: getStatus(nftScore),
      details: 'NFT holdings and marketplace activity',
      recommendations: [
        'Mint NFTs from reputable projects',
        'Participate in NFT communities',
        'Trade on established marketplaces',
      ],
    },
    {
      category: 'Airdrop Eligibility',
      score: airdropScore,
      maxScore: 100,
      status: getStatus(airdropScore),
      details: 'Qualification for potential airdrops',
      recommendations: [
        'Use new protocols early',
        'Complete protocol-specific tasks',
        'Maintain activity across multiple chains',
      ],
    },
  ];

  // Calculate overall score
  const overall = Math.floor(
    metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length
  );

  // Determine grade
  const grade = getGrade(overall);

  // Determine risk level
  const riskLevel = securityScore >= 80 ? 'low' : securityScore >= 60 ? 'medium' : 'high';

  // Calculate airdrop readiness
  const airdropReadiness = Math.floor((airdropScore + activityScore + diversityScore) / 3);

  // Generate strengths and weaknesses
  const strengths = [];
  const weaknesses = [];

  metrics.forEach((metric) => {
    if (metric.score >= 80) {
      strengths.push(`Strong ${metric.category.toLowerCase()} with ${metric.score}/100 score`);
    } else if (metric.score < 60) {
      weaknesses.push(`${metric.category} needs improvement (${metric.score}/100)`);
    }
  });

  // Ensure we have at least some items
  if (strengths.length === 0) {
    strengths.push('Consistent wallet activity');
    strengths.push('Good security practices');
  }
  if (weaknesses.length === 0) {
    weaknesses.push('Could increase DeFi participation');
    weaknesses.push('Consider diversifying across more chains');
  }

  const healthScore = {
    overall,
    grade,
    metrics,
    strengths,
    weaknesses,
    riskLevel,
    airdropReadiness,
  };

  // Generate historical scores
  const historicalScores = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Generate score with slight variation
    const variation = Math.floor(Math.random() * 10) - 5;
    const score = Math.max(0, Math.min(100, overall + variation));
    
    historicalScores.push({ date: dateStr, score });
  }

  // Generate radar data
  const radarData = metrics.map((metric) => ({
    metric: metric.category,
    score: metric.score,
    fullMark: 100,
  }));

  // Generate recommendations
  const recommendations = [
    {
      priority: 'high' as const,
      title: 'Increase DeFi Protocol Interactions',
      description: 'Interact with at least 5 different DeFi protocols to improve diversity score',
      impact: 15,
    },
    {
      priority: 'high' as const,
      title: 'Revoke Unused Token Approvals',
      description: 'Review and revoke old token approvals to improve security score',
      impact: 12,
    },
    {
      priority: 'medium' as const,
      title: 'Bridge to New Chains',
      description: 'Expand to Layer 2 solutions like Arbitrum, Optimism, or Base',
      impact: 10,
    },
    {
      priority: 'medium' as const,
      title: 'Participate in Governance',
      description: 'Vote on DAO proposals to increase engagement score',
      impact: 8,
    },
    {
      priority: 'low' as const,
      title: 'Mint Commemorative NFTs',
      description: 'Collect protocol NFTs and POAPs to boost NFT activity',
      impact: 5,
    },
  ];

  return {
    healthScore,
    historicalScores,
    radarData,
    recommendations,
  };
}

function getStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

function getGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}
=======


>>>>>>> f95dd33 (feat: Add on-chain token balance checker API endpoint)
