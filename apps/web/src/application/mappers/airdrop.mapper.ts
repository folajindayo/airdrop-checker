/**
 * Airdrop Mapper
 * Converts between domain entities and DTOs
 */

import { AirdropEntity } from '../../domain/entities/airdrop.entity';
import { AirdropDTO } from '../dtos/airdrop.dto';

export class AirdropMapper {
  static toDTO(entity: AirdropEntity): AirdropDTO {
    return {
      id: entity.id,
      name: entity.name,
      symbol: entity.symbol,
      totalAmount: entity.totalAmount.toString(),
      claimAmount: entity.claimAmount.toString(),
      startDate: entity.startDate.toISOString(),
      endDate: entity.endDate.toISOString(),
      chainId: entity.chainId,
      contractAddress: entity.contractAddress,
      status: entity.status,
      eligibilityCriteria: entity.eligibilityCriteria,
      metadata: entity.metadata,
      isActive: entity.isActive(),
      canClaim: entity.canClaim(),
      claimPercentage: entity.getClaimPercentage(),
    };
  }

  static toDTOList(entities: AirdropEntity[]): AirdropDTO[] {
    return entities.map((entity) => this.toDTO(entity));
  }
}

