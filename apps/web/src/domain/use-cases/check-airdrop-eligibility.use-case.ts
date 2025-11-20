/**
 * Check Airdrop Eligibility Use Case
 * Business logic for checking wallet eligibility for airdrops
 */

import { AirdropRepository, EligibilityResult } from '../repositories';
import { Address } from '../value-objects';

export interface CheckAirdropEligibilityInput {
  airdropId: string;
  walletAddress: string;
}

export interface CheckAirdropEligibilityOutput {
  success: boolean;
  eligibilityResult?: EligibilityResult;
  error?: string;
}

export class CheckAirdropEligibilityUseCase {
  constructor(private readonly airdropRepository: AirdropRepository) {}

  async execute(input: CheckAirdropEligibilityInput): Promise<CheckAirdropEligibilityOutput> {
    try {
      // Validate wallet address
      const address = Address.create(input.walletAddress);

      // Find airdrop
      const airdrop = await this.airdropRepository.findById(input.airdropId);
      
      if (!airdrop) {
        return {
          success: false,
          error: 'Airdrop not found',
        };
      }

      // Check eligibility
      const eligibilityResult = await this.airdropRepository.checkEligibility(
        input.airdropId,
        address.value
      );

      return {
        success: true,
        eligibilityResult,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

