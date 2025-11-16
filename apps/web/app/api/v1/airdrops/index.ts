/**
 * Centralized airdrop API routes
 * Provides consolidated access to all airdrop-related endpoints
 */

export { GET as checkAirdrop } from '../../airdrop-check/[address]/route';
export { GET as getAirdrops } from '../../airdrops/route';
export { GET as getAirdropProbability } from '../../airdrop-probability/[address]/route';
export { GET as getClaimStatus } from '../../airdrop-claim-status/[address]/route';
export { GET as simulateAirdrop, POST as createSimulation } from '../../airdrop-simulator/route';
export { GET as getFarmingOpportunities } from '../../airdrop-farming/route';

// Type definitions for airdrop endpoints
export interface AirdropCheckParams {
  address: string;
  chains?: string[];
}

export interface AirdropResponse {
  address: string;
  airdrops: Array<{
    project: string;
    eligible: boolean;
    score: number;
    criteria: Record<string, boolean>;
  }>;
  summary: {
    total: number;
    eligible: number;
    pending: number;
  };
}

export interface FarmingOpportunity {
  project: string;
  apy: number;
  tvl: number;
  risk: 'low' | 'medium' | 'high';
  requirements: string[];
  eligibilityScore?: number;
}

