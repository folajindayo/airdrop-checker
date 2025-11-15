/**
 * @fileoverview Airdrop eligibility utility functions
 */

import type { Criterion, AirdropEligibility } from '../types';

/**
 * Calculate eligibility percentage
 */
export function calculateEligibilityPercentage(criteria: Criterion[]): number {
  if (criteria.length === 0) return 0;
  const metCount = criteria.filter(c => c.met).length;
  return Math.round((metCount / criteria.length) * 100);
}

/**
 * Check if wallet is eligible
 */
export function isWalletEligible(eligibility: AirdropEligibility): boolean {
  return eligibility.status === 'eligible';
}

/**
 * Calculate total score from criteria
 */
export function calculateTotalScore(criteria: Criterion[]): number {
  return criteria.reduce((sum, c) => {
    return sum + (c.met && c.points ? c.points : 0);
  }, 0);
}

