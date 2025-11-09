import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress, cache, CACHE_TTL, calculateOverallScore } from '@airdrop-finder/shared';
import type { CheckResult, AirdropCheckResult } from '@airdrop-finder/shared';
import { findAllProjects } from '@/lib/db/models/project';
import {
  fetchAllChainTransactions,
  fetchAllChainNFTs,
} from '@/lib/goldrush';
import { aggregateUserActivity } from '@/lib/analyzers/activity';
import { checkAllCriteria, calculateCriteriaPercentage } from '@/lib/analyzers/criteria-checker';

export const dynamic = 'force-dynamic';

/**
 * GET /api/airdrop-check/[address]
 * Check airdrop eligibility for a wallet address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    // Validate address
    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    // Check cache first
    const cacheKey = `airdrop-check:${normalizedAddress}`;
    const cachedResult = cache.get<CheckResult>(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    // Fetch all airdrop projects from database
    const projects = await findAllProjects();

    if (projects.length === 0) {
      return NextResponse.json(
        { 
          error: 'No airdrop projects found', 
          message: 'The database has not been seeded yet. Please run: cd apps/web && pnpm seed',
          details: 'MongoDB needs at least 500MB free space to seed the database.'
        },
        { status: 503 }
      );
    }

    // Fetch user's blockchain activity
    console.log(`Fetching activity for ${address}...`);
    
    const [chainTransactions, chainNFTs] = await Promise.all([
      fetchAllChainTransactions(normalizedAddress),
      fetchAllChainNFTs(normalizedAddress),
    ]);

    // Aggregate user activity
    const userActivity = aggregateUserActivity(
      normalizedAddress,
      chainTransactions,
      chainNFTs
    );

    // Check eligibility for each project
    const airdropResults: AirdropCheckResult[] = projects.map((project) => {
      const criteriaResults = checkAllCriteria(project.criteria, userActivity);
      const score = calculateCriteriaPercentage(criteriaResults);

      return {
        project: project.name,
        projectId: project.id,
        slug: project.slug,
        status: project.status,
        score: Math.round(score),
        criteria: criteriaResults,
        logo: project.logo,
        officialUrl: project.officialUrl,
      };
    });

    // Calculate overall score
    const overallScore = calculateOverallScore(airdropResults);

    // Build response
    const result: CheckResult = {
      address: normalizedAddress,
      overallScore,
      airdrops: airdropResults,
      timestamp: Date.now(),
    };

    // Cache the result
    cache.set(cacheKey, result, CACHE_TTL.AIRDROP_CHECK);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking airdrop eligibility:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to check airdrop eligibility',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

