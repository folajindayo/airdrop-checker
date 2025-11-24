/**
 * Get Active Airdrops Use Case
 * Retrieves all currently active airdrops with filtering
 */

import { IAirdropRepository, AirdropFilters, PaginationParams } from '../repositories/airdrop.repository';
import { AirdropEntity } from '../entities/airdrop.entity';

export interface GetActiveAirdropsRequest {
  chainId?: number;
  minAmount?: bigint;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetActiveAirdropsResponse {
  airdrops: AirdropEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class GetActiveAirdropsUseCase {
  constructor(private readonly airdropRepository: IAirdropRepository) {}

  async execute(request: GetActiveAirdropsRequest): Promise<GetActiveAirdropsResponse> {
    const filters: AirdropFilters = {
      status: 'active',
      chainId: request.chainId,
      minAmount: request.minAmount,
      search: request.search,
    };

    const pagination: PaginationParams = {
      page: request.page || 1,
      limit: request.limit || 20,
      sortBy: request.sortBy || 'startDate',
      sortOrder: request.sortOrder || 'desc',
    };

    const result = await this.airdropRepository.find(filters, pagination);

    return {
      airdrops: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}


