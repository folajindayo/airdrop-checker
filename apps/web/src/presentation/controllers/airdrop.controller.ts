/**
 * Airdrop Controller
 * HTTP API endpoints for airdrops
 */

import { AirdropEligibilityService } from '../../application/services/airdrop-eligibility.service';
import { GetActiveAirdropsUseCase } from '../../domain/use-cases/get-active-airdrops.use-case';
import { AirdropMapper } from '../../application/mappers/airdrop.mapper';

export class AirdropController {
  constructor(
    private readonly eligibilityService: AirdropEligibilityService,
    private readonly getActiveAirdropsUseCase: GetActiveAirdropsUseCase
  ) {}

  async checkEligibility(req: {
    walletAddress: string;
    chainId: number;
    airdropId?: string;
  }) {
    try {
      const results = await this.eligibilityService.checkEligibility(
        req.walletAddress,
        req.chainId,
        req.airdropId
      );

      return {
        success: true,
        data: results,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getActiveAirdrops(req: {
    chainId?: number;
    page?: number;
    limit?: number;
  }) {
    try {
      const result = await this.getActiveAirdropsUseCase.execute(req);

      return {
        success: true,
        data: {
          airdrops: AirdropMapper.toDTOList(result.airdrops),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getEligibleAirdrops(req: { walletAddress: string; chainId: number }) {
    try {
      const eligible = await this.eligibilityService.getEligibleAirdrops(
        req.walletAddress,
        req.chainId
      );

      return {
        success: true,
        data: eligible,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}


