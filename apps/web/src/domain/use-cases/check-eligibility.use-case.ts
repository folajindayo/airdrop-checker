/**
 * Check Eligibility Use Case
 * Determines if a wallet is eligible for specific airdrops
 */

import { IAirdropRepository } from '../repositories/airdrop.repository';
import { IWalletRepository } from '../repositories/wallet.repository';
import { AirdropEntity } from '../entities/airdrop.entity';

export interface CheckEligibilityRequest {
  walletAddress: string;
  chainId: number;
  airdropId?: string;
}

export interface EligibilityResult {
  airdrop: AirdropEntity;
  isEligible: boolean;
  criteriaResults: CriteriaResult[];
  estimatedAmount?: string;
  claimStatus: 'eligible' | 'not_eligible' | 'already_claimed' | 'expired';
}

export interface CriteriaResult {
  type: string;
  requirement: string;
  met: boolean;
  reason?: string;
}

export class CheckEligibilityUseCase {
  constructor(
    private readonly airdropRepository: IAirdropRepository,
    private readonly walletRepository: IWalletRepository
  ) {}

  async execute(request: CheckEligibilityRequest): Promise<EligibilityResult[]> {
    // Validate wallet
    const wallet = await this.walletRepository.findByAddress(
      request.walletAddress,
      request.chainId
    );

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Get airdrops to check
    let airdrops: AirdropEntity[];
    
    if (request.airdropId) {
      const airdrop = await this.airdropRepository.findById(request.airdropId);
      airdrops = airdrop ? [airdrop] : [];
    } else {
      airdrops = await this.airdropRepository.findActive();
    }

    // Check eligibility for each airdrop
    const results: EligibilityResult[] = [];

    for (const airdrop of airdrops) {
      const result = await this.checkAirdropEligibility(airdrop, wallet.address);
      results.push(result);
    }

    return results;
  }

  private async checkAirdropEligibility(
    airdrop: AirdropEntity,
    walletAddress: string
  ): Promise<EligibilityResult> {
    const criteriaResults: CriteriaResult[] = [];

    // Check each eligibility criterion
    for (const criteria of airdrop.eligibilityCriteria) {
      const result = await this.checkCriteria(criteria, walletAddress);
      criteriaResults.push(result);
    }

    const isEligible = criteriaResults.every((r) => r.met);
    const claimStatus = this.determineClaimStatus(airdrop, isEligible);

    return {
      airdrop,
      isEligible,
      criteriaResults,
      claimStatus,
    };
  }

  private async checkCriteria(
    criteria: any,
    walletAddress: string
  ): Promise<CriteriaResult> {
    // Implementation would check actual blockchain data
    return {
      type: criteria.type,
      requirement: criteria.requirement,
      met: criteria.met || false,
      reason: criteria.met ? 'Requirement met' : 'Requirement not met',
    };
  }

  private determineClaimStatus(
    airdrop: AirdropEntity,
    isEligible: boolean
  ): 'eligible' | 'not_eligible' | 'already_claimed' | 'expired' {
    if (airdrop.isClaimed()) {
      return 'already_claimed';
    }

    if (airdrop.hasEnded()) {
      return 'expired';
    }

    return isEligible ? 'eligible' : 'not_eligible';
  }
}


