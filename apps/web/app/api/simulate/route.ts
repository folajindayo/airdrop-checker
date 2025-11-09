import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { findAllProjects } from '@/lib/db/models/project';
import { fetchAllChainTransactions, fetchAllChainNFTs } from '@/lib/goldrush';
import { aggregateUserActivity } from '@/lib/analyzers/activity-aggregator';
import { checkCriteria } from '@/lib/analyzers/criteria-checker';

export const dynamic = 'force-dynamic';

/**
 * POST /api/simulate
 * Simulate airdrop eligibility with hypothetical interactions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, simulatedInteractions } = body;

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address required' },
        { status: 400 }
      );
    }

    if (!simulatedInteractions || !Array.isArray(simulatedInteractions)) {
      return NextResponse.json(
        { error: 'simulatedInteractions array required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    // Fetch current activity
    const [chainTransactions, chainNFTs] = await Promise.all([
      fetchAllChainTransactions(normalizedAddress),
      fetchAllChainNFTs(normalizedAddress),
    ]);

    // Aggregate current activity
    const currentActivity = aggregateUserActivity(
      normalizedAddress,
      chainTransactions,
      chainNFTs
    );

    // Apply simulated interactions
    const simulatedActivity = { ...currentActivity };
    
    simulatedInteractions.forEach((interaction: any) => {
      const { type, protocol, chain, count = 1 } = interaction;
      
      switch (type) {
        case 'swap':
          if (!simulatedActivity.swaps) simulatedActivity.swaps = {};
          simulatedActivity.swaps[protocol] = (simulatedActivity.swaps[protocol] || 0) + count;
          break;
        case 'nft_mint':
          if (!simulatedActivity.nftPlatforms) simulatedActivity.nftPlatforms = {};
          simulatedActivity.nftPlatforms[protocol] = (simulatedActivity.nftPlatforms[protocol] || 0) + count;
          break;
        case 'bridge':
          if (!simulatedActivity.bridges) simulatedActivity.bridges = {};
          simulatedActivity.bridges[protocol] = (simulatedActivity.bridges[protocol] || 0) + count;
          break;
        case 'lend':
          if (!simulatedActivity.lendingProtocols) simulatedActivity.lendingProtocols = {};
          simulatedActivity.lendingProtocols[protocol] = (simulatedActivity.lendingProtocols[protocol] || 0) + count;
          break;
      }

      // Update chain activity
      if (chain) {
        if (!simulatedActivity.chains) simulatedActivity.chains = {};
        simulatedActivity.chains[chain] = (simulatedActivity.chains[chain] || 0) + count;
      }
    });

    // Fetch all projects
    const projects = await findAllProjects();

    // Check eligibility with simulated activity
    const results = projects.map((project) => {
      const criteriaResults = project.criteria?.map((criterion) => {
        const met = checkCriteria(criterion, simulatedActivity);
        return {
          description: criterion.description || '',
          met,
        };
      }) || [];

      const score = criteriaResults.length > 0
        ? Math.round((criteriaResults.filter((c) => c.met).length / criteriaResults.length) * 100)
        : 0;

      return {
        project: project.name,
        projectId: project.projectId,
        slug: project.slug,
        status: project.status,
        score,
        criteria: criteriaResults,
        improvement: 0, // Will calculate below
      };
    });

    // Calculate improvements - fetch current eligibility
    let currentResults = { airdrops: [], overallScore: 0 };
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
      const currentResponse = await fetch(`${baseUrl}/api/airdrop-check/${normalizedAddress}`);
      if (currentResponse.ok) {
        currentResults = await currentResponse.json();
      }
    } catch (error) {
      console.error('Failed to fetch current eligibility:', error);
    }

    const improvements = results.map((simulated) => {
      const current = currentResults.airdrops?.find(
        (a: any) => a.projectId === simulated.projectId
      );
      const improvement = current ? simulated.score - current.score : simulated.score;
      return {
        ...simulated,
        improvement,
      };
    });

    // Calculate overall score
    const overallScore = improvements.length > 0
      ? Math.round(improvements.reduce((sum, r) => sum + r.score, 0) / improvements.length)
      : 0;

    return NextResponse.json({
      success: true,
      address: normalizedAddress,
      currentScore: currentResults.overallScore || 0,
      simulatedScore: overallScore,
      improvement: overallScore - (currentResults.overallScore || 0),
      airdrops: improvements,
      simulatedInteractions,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Simulate API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to simulate eligibility',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

