/**
 * Airdrop Type Definitions
 */

export type AirdropStatus = 'active' | 'upcoming' | 'ended' | 'claimed' | 'expired';

export interface IAirdrop {
  id: string;
  name: string;
  symbol: string;
  totalAmount: string;
  claimAmount: string;
  startDate: string;
  endDate: string;
  chainId: number;
  contractAddress: string;
  status: AirdropStatus;
  eligibilityCriteria: string[];
  claimedAmount?: string;
  claimers?: number;
}

export interface IEligibilityResult {
  eligible: boolean;
  airdropId: string;
  walletAddress: string;
  claimAmount?: string;
  criteria: {
    met: string[];
    unmet: string[];
  };
}

export interface IAirdropSearchParams {
  query?: string;
  chainId?: number;
  status?: AirdropStatus;
  page?: number;
  limit?: number;
}


