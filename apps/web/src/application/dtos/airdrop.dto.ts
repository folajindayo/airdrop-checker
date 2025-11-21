/**
 * Airdrop DTOs
 */

export interface AirdropDTO {
  id: string;
  name: string;
  description: string;
  status: string;
  eligibilityCriteria: string[];
  rewardAmount: string;
  startDate: Date;
  endDate: Date;
}

export interface CreateAirdropDTO {
  name: string;
  description: string;
  eligibilityCriteria: string[];
  rewardAmount: string;
  startDate: Date;
  endDate: Date;
}

export interface UpdateAirdropDTO {
  name?: string;
  description?: string;
  status?: string;
  eligibilityCriteria?: string[];
  rewardAmount?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AirdropListDTO {
  airdrops: AirdropDTO[];
  total: number;
  page: number;
  pageSize: number;
}
