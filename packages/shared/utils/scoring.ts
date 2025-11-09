import type {
  AirdropProject,
  AirdropCheckResult,
  CriteriaResult,
  ScoringWeights,
  AirdropStatus,
} from '../types';

/**
 * Default scoring weights based on airdrop status
 */
export const DEFAULT_WEIGHTS: ScoringWeights = {
  confirmed: 1.0,
  rumored: 0.8,
  speculative: 0.5,
  expired: 0.0,
};

/**
 * Calculate eligibility score for a single project
 */
export function calculateProjectScore(
  project: AirdropProject,
  criteriaResults: CriteriaResult[]
): number {
  if (criteriaResults.length === 0) {
    return 0;
  }

  const metCount = criteriaResults.filter((c) => c.met).length;
  const totalCount = criteriaResults.length;

  return (metCount / totalCount) * 100;
}

/**
 * Calculate overall score across all projects
 */
export function calculateOverallScore(
  results: AirdropCheckResult[],
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  if (results.length === 0) {
    return 0;
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const result of results) {
    const weight = weights[result.status] || 0;
    totalWeightedScore += result.score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round(totalWeightedScore / totalWeight);
}

/**
 * Get weight for a specific status
 */
export function getStatusWeight(
  status: AirdropStatus,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  return weights[status] || 0;
}

/**
 * Format score for display
 */
export function formatScore(score: number): string {
  return `${Math.round(score)}/100`;
}

/**
 * Get score level (High/Moderate/Low)
 */
export function getScoreLevel(score: number): 'high' | 'moderate' | 'low' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'moderate';
  return 'low';
}

/**
 * Get score level label
 */
export function getScoreLevelLabel(score: number): string {
  const level = getScoreLevel(score);
  
  switch (level) {
    case 'high':
      return 'High Likelihood';
    case 'moderate':
      return 'Moderate Chance';
    case 'low':
      return 'Low Chance';
  }
}

/**
 * Get score color class
 */
export function getScoreColorClass(score: number): string {
  const level = getScoreLevel(score);
  
  switch (level) {
    case 'high':
      return 'text-green-500';
    case 'moderate':
      return 'text-yellow-500';
    case 'low':
      return 'text-red-500';
  }
}

