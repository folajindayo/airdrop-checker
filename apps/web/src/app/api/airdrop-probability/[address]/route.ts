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

    const probabilityData = generateMockProbabilityData(address);

    return NextResponse.json(probabilityData);
  } catch (error) {
    console.error('Airdrop probability API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airdrop probability data' },
      { status: 500 }
    );
  }
}

function generateMockProbabilityData(address: string) {
  // Calculate individual factor scores
  const activityScore = Math.floor(Math.random() * 30) + 70;
  const diversityScore = Math.floor(Math.random() * 30) + 65;
  const earlyAdoptionScore = Math.floor(Math.random() * 35) + 60;
  const valueLocked = Math.floor(Math.random() * 40) + 55;
  const communityEngagement = Math.floor(Math.random() * 35) + 60;

  const factors = [
    {
      factor: 'Activity Level',
      score: activityScore,
      maxScore: 100,
      impact: 'high' as const,
      description: 'Regular transactions and protocol interactions boost eligibility',
    },
    {
      factor: 'Protocol Diversity',
      score: diversityScore,
      maxScore: 100,
      impact: 'high' as const,
      description: 'Using multiple protocols increases airdrop opportunities',
    },
    {
      factor: 'Early Adoption',
      score: earlyAdoptionScore,
      maxScore: 100,
      impact: 'high' as const,
      description: 'Being an early user of protocols significantly improves chances',
    },
    {
      factor: 'Value Locked',
      score: valueLocked,
      maxScore: 100,
      impact: 'medium' as const,
      description: 'Higher TVL and longer holding periods are rewarded',
    },
    {
      factor: 'Community Engagement',
      score: communityEngagement,
      maxScore: 100,
      impact: 'medium' as const,
      description: 'Governance participation and social activity matter',
    },
  ];

  // Calculate overall score
  const overallScore = Math.floor(
    factors.reduce((sum, f) => sum + f.score, 0) / factors.length
  );

  // Determine grade
  const grade = getGrade(overallScore);

  // Generate radar data
  const radarData = factors.map((f) => ({
    factor: f.factor,
    score: f.score,
    fullMark: 100,
  }));

  // Generate projects
  const projectNames = [
    'zkSync Era',
    'LayerZero',
    'Scroll',
    'Linea',
    'Base',
    'Starknet',
    'Polygon zkEVM',
    'Arbitrum Orbit',
  ];

  const chains = ['Ethereum', 'zkSync', 'Arbitrum', 'Optimism', 'Base'];
  const statuses: ('confirmed' | 'likely' | 'speculative')[] = ['confirmed', 'likely', 'speculative'];

  const projects = projectNames.map((name) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const baseProbability = status === 'confirmed' ? 80 : status === 'likely' ? 60 : 40;
    const probability = Math.min(95, baseProbability + Math.floor(Math.random() * 20));

    const criteriaList = [
      { name: 'Bridge to network', weight: 20 },
      { name: 'Perform 10+ transactions', weight: 15 },
      { name: 'Use 5+ protocols', weight: 15 },
      { name: 'Provide liquidity', weight: 15 },
      { name: 'Hold for 30+ days', weight: 10 },
      { name: 'Interact with NFTs', weight: 10 },
      { name: 'Participate in governance', weight: 10 },
      { name: 'Early adopter bonus', weight: 5 },
    ];

    const criteria = criteriaList.map((c) => ({
      ...c,
      met: Math.random() > 0.3,
    }));

    return {
      name,
      probability,
      estimatedValue: Math.floor(Math.random() * 5000) + 500,
      criteria,
      deadline:
        Math.random() > 0.5
          ? new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      chain: chains[Math.floor(Math.random() * chains.length)],
      status,
    };
  });

  // Sort by probability
  projects.sort((a, b) => b.probability - a.probability);

  // Calculate estimated total
  const estimatedTotal = projects.reduce(
    (sum, p) => sum + (p.estimatedValue * p.probability) / 100,
    0
  );

  // Generate recommendations
  const recommendations = [
    'Increase transaction frequency to at least 3-5 per week',
    'Diversify across more Layer 2 networks (zkSync, Arbitrum, Optimism)',
    'Provide liquidity on new DEXes to maximize early adopter benefits',
    'Participate in governance votes to show community engagement',
    'Use bridges regularly to demonstrate cross-chain activity',
    'Mint NFTs and interact with NFT marketplaces',
    'Hold positions for longer periods to qualify for time-based criteria',
    'Follow official project channels for airdrop announcements',
  ];

  return {
    overallScore,
    grade,
    projects,
    factors,
    radarData,
    recommendations,
    estimatedTotal: Math.floor(estimatedTotal),
  };
}

function getGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

