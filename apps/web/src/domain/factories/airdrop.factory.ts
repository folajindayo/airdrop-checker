/**
 * Airdrop Factory
 */

import { Airdrop } from '../entities/airdrop.entity';

export class AirdropFactory {
  static create(data: any): Airdrop {
    return new Airdrop(
      data.id,
      data.name,
      data.description,
      data.status,
      data.eligibilityCriteria,
      data.rewardAmount,
      data.startDate,
      data.endDate
    );
  }

  static createFromAPI(apiData: any): Airdrop {
    return AirdropFactory.create({
      id: apiData.id,
      name: apiData.name,
      description: apiData.description,
      status: apiData.status || 'upcoming',
      eligibilityCriteria: apiData.criteria || [],
      rewardAmount: apiData.reward_amount,
      startDate: apiData.start_date,
      endDate: apiData.end_date,
    });
  }
}

