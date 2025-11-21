/**
 * Airdrop Mapper
 */

import { Airdrop } from '../../domain/entities/airdrop.entity';
import { AirdropDTO } from '../dtos/airdrop.dto';

export class AirdropMapper {
  static toDTO(entity: Airdrop): AirdropDTO {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      eligibilityCriteria: entity.eligibilityCriteria,
      rewardAmount: entity.rewardAmount,
      startDate: entity.startDate,
      endDate: entity.endDate,
    };
  }

  static toDTOList(entities: Airdrop[]): AirdropDTO[] {
    return entities.map(entity => this.toDTO(entity));
  }

  static toEntity(dto: AirdropDTO): Airdrop {
    return new Airdrop(
      dto.id,
      dto.name,
      dto.description,
      dto.status,
      dto.eligibilityCriteria,
      dto.rewardAmount,
      dto.startDate,
      dto.endDate
    );
  }
}
