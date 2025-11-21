/**
 * Airdrop Data Transfer Objects
 */

export interface AirdropDTO {
  id: string;
  name: string;
  symbol: string;
  totalAmount: string;
  claimAmount: string;
  startDate: string;
  endDate: string;
  chainId: number;
  contractAddress: string;
  status: string;
  eligibilityCriteria: EligibilityCriteriaDTO[];
  metadata?: AirdropMetadataDTO;
  isActive: boolean;
  canClaim: boolean;
  claimPercentage: number;
}

export interface EligibilityCriteriaDTO {
  type: string;
  requirement: string;
  value: string | number;
  met?: boolean;
}

export interface AirdropMetadataDTO {
  description?: string;
  website?: string;
  twitter?: string;
  logoUrl?: string;
  requirements?: string[];
}

export interface CheckEligibilityDTO {
  walletAddress: string;
  chainId: number;
  airdropId?: string;
}

export interface EligibilityResultDTO {
  airdrop: AirdropDTO;
  isEligible: boolean;
  criteriaResults: {
    type: string;
    requirement: string;
    met: boolean;
    reason?: string;
  }[];
  claimStatus: string;
}

