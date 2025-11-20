/**
 * Get Wallet Airdrops Use Case
 * Business logic for fetching airdrops relevant to a wallet
 */

import { AirdropEntity } from '../entities';
import { AirdropRepository, WalletRepository } from '../repositories';
import { Address } from '../value-objects';

export interface GetWalletAirdropsInput {
  walletAddress: string;
  chainIds?: number[];
  includeEnded?: boolean;
  limit?: number;
}

export interface GetWalletAirdropsOutput {
  success: boolean;
  airdrops?: AirdropEntity[];
  eligibilityScores?: Record<string, number>;
  error?: string;
}

export class GetWalletAirdropsUseCase {
  constructor(
    private readonly airdropRepository: AirdropRepository,
    private readonly walletRepository: WalletRepository
  ) {}

  async execute(input: GetWalletAirdropsInput): Promise<GetWalletAirdropsOutput> {
    try {
      // Validate address
      const address = Address.create(input.walletAddress);

      // Fetch airdrops with filters
      const airdrops = await this.airdropRepository.findAll({
        chainIds: input.chainIds,
        status: input.includeEnded
          ? undefined
          : ['upcoming', 'active'],
        limit: input.limit || 50,
        sortBy: 'startDate',
        sortOrder: 'desc',
      });

      // Check eligibility for each airdrop
      const eligibilityScores: Record<string, number> = {};
      
      for (const airdrop of airdrops) {
        try {
          const result = await this.airdropRepository.checkEligibility(
            airdrop.id,
            address.value
          );
          eligibilityScores[airdrop.id] = result.score;
        } catch (error) {
          // Skip if eligibility check fails
          eligibilityScores[airdrop.id] = 0;
        }
      }

      // Sort by eligibility score
      const sortedAirdrops = airdrops.sort((a, b) => {
        return (eligibilityScores[b.id] || 0) - (eligibilityScores[a.id] || 0);
      });

      return {
        success: true,
        airdrops: sortedAirdrops,
        eligibilityScores,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

