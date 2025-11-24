/**
 * Airdrop check service
 * Business logic for checking airdrop eligibility
 * 
 * @module AirdropCheckService
 */

import type { CheckResult, AirdropCheckResult } from '@airdrop-finder/shared';
import { calculateOverallScore } from '@airdrop-finder/shared';
import { findAllProjects } from '../db/models/project';
import { fetchAllChainTransactions, fetchAllChainNFTs } from '../goldrush';
import { aggregateUserActivity } from '../analyzers/activity';
import { checkAllCriteria, calculateCriteriaPercentage } from '../analyzers/criteria-checker';

/**
 * Check airdrop eligibility for an address
 * 
 * @param address - Ethereum address to check eligibility for
 * @returns Check result with overall score and airdrop eligibility details
 * @throws {Error} If no projects found or data fetch fails
 * 
 * @example
 * ```typescript
 * const result = await checkAirdropEligibility('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
 * console.log(result.overallScore); // Overall eligibility score (0-100)
 * console.log(result.airdrops); // Array of airdrop eligibility results
 * ```
 */
export async function checkAirdropEligibility(
  address: string
): Promise<CheckResult> {
  // Fetch all airdrop projects
  const projects = await findAllProjects();
  
  if (projects.length === 0) {
    throw new Error('No airdrop projects found. Database not seeded.');
  }
  
  // Fetch user's blockchain activity
  const [chainTransactions, chainNFTs] = await Promise.all([
    fetchAllChainTransactions(address),
    fetchAllChainNFTs(address),
  ]);
  
  // Aggregate user activity
  const userActivity = aggregateUserActivity(
    address,
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
      status: project.status,
      score: Math.round(score),
      criteria: criteriaResults,
      logoUrl: project.logoUrl,
      websiteUrl: project.websiteUrl,
      claimUrl: project.claimUrl,
    };
  });
  
  // Calculate overall score
  const overallScore = calculateOverallScore(airdropResults);
  
  return {
    address: address.toLowerCase(),
    overallScore,
    airdrops: airdropResults,
    timestamp: Date.now(),
  };
}

/**
 * Get user activity summary
 * 
 * @param address - Ethereum address to get activity for
 * @returns Aggregated user activity data
 * @throws {Error} If data fetch fails
 * 
 * @example
 * ```typescript
 * const activity = await getUserActivitySummary('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
 * console.log(activity.transactionCount); // Total transaction count
 * ```
 */
export async function getUserActivitySummary(address: string) {
  const [chainTransactions, chainNFTs] = await Promise.all([
    fetchAllChainTransactions(address),
    fetchAllChainNFTs(address),
  ]);
  
  return aggregateUserActivity(address, chainTransactions, chainNFTs);
}
