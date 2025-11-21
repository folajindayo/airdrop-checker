/**
 * Airdrop Eligibility Service
 * Application layer service for eligibility checking
 */

import { CheckEligibilityUseCase } from '../../domain/use-cases/check-eligibility.use-case';

export class AirdropEligibilityService {
  constructor(private readonly checkEligibilityUseCase: CheckEligibilityUseCase) {}

  async checkEligibility(walletAddress: string, chainId: number, airdropId?: string) {
    return await this.checkEligibilityUseCase.execute({
      walletAddress,
      chainId,
      airdropId,
    });
  }

  async getEligibleAirdrops(walletAddress: string, chainId: number) {
    const results = await this.checkEligibilityUseCase.execute({
      walletAddress,
      chainId,
    });

    return results.filter((r) => r.isEligible);
  }

  async getIneligibleReasons(walletAddress: string, chainId: number, airdropId: string) {
    const results = await this.checkEligibilityUseCase.execute({
      walletAddress,
      chainId,
      airdropId,
    });

    const result = results[0];
    if (!result || result.isEligible) {
      return [];
    }

    return result.criteriaResults.filter((c) => !c.met).map((c) => c.reason || 'Not met');
  }
}

