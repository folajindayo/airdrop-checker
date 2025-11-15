/**
 * Airdrop-related type definitions
 */

export interface AirdropProject {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'upcoming' | 'ended';
  eligibilityCriteria: string[];
}

export interface AirdropEligibilityResult {
  eligible: boolean;
  score: number;
  details: Record<string, any>;
}

export * from '../components/airdrop-eligibility-card';
