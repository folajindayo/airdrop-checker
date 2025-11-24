/**
 * Search Airdrops Use Case
 * Provides comprehensive airdrop search functionality
 */

import { IAirdropRepository, AirdropFilters, PaginationParams } from '../repositories/airdrop.repository';

export interface SearchAirdropsRequest {
  query: string;
  chainId?: number;
  status?: string;
  page?: number;
  limit?: number;
}

export class SearchAirdropsUseCase {
  constructor(private readonly airdropRepository: IAirdropRepository) {}

  async execute(request: SearchAirdropsRequest) {
    if (!request.query || request.query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }

    const filters: AirdropFilters = {
      search: request.query.trim(),
      chainId: request.chainId,
      status: request.status,
    };

    const pagination: PaginationParams = {
      page: request.page || 1,
      limit: request.limit || 20,
      sortBy: 'startDate',
      sortOrder: 'desc',
    };

    return await this.airdropRepository.find(filters, pagination);
  }
}


