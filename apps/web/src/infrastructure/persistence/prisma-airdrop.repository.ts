/**
 * Prisma Airdrop Repository Implementation
 * Infrastructure layer implementation of AirdropRepository
 */

import {
  AirdropEntity,
  AirdropStatus,
  createAirdropEntity,
} from '../../domain/entities';
import {
  AirdropRepository,
  AirdropFilters,
  EligibilityResult,
} from '../../domain/repositories';

export class PrismaAirdropRepository implements AirdropRepository {
  constructor(private readonly prisma: any) {}

  async findById(id: string): Promise<AirdropEntity | null> {
    const airdrop = await this.prisma.airdrop.findUnique({
      where: { id },
      include: {
        eligibilityCriteria: true,
        metadata: true,
      },
    });

    if (!airdrop) return null;

    return this.toDomain(airdrop);
  }

  async findAll(filters?: AirdropFilters): Promise<AirdropEntity[]> {
    const where: any = {};

    if (filters?.status) {
      where.status = { in: filters.status };
    }

    if (filters?.chainIds) {
      where.chainId = { in: filters.chainIds };
    }

    if (filters?.protocols) {
      where.protocol = { in: filters.protocols };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { protocol: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.verified !== undefined) {
      where.metadata = { verified: filters.verified };
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.metadata = {
        tags: { hasSome: filters.tags },
      };
    }

    const airdrops = await this.prisma.airdrop.findMany({
      where,
      include: {
        eligibilityCriteria: true,
        metadata: true,
      },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
      orderBy: filters?.sortBy
        ? { [filters.sortBy]: filters.sortOrder || 'desc' }
        : { startDate: 'desc' },
    });

    return airdrops.map(this.toDomain);
  }

  async findByStatus(status: AirdropStatus): Promise<AirdropEntity[]> {
    return this.findAll({ status: [status] });
  }

  async findByProtocol(protocol: string): Promise<AirdropEntity[]> {
    return this.findAll({ protocols: [protocol] });
  }

  async checkEligibility(
    airdropId: string,
    walletAddress: string
  ): Promise<EligibilityResult> {
    const airdrop = await this.findById(airdropId);
    
    if (!airdrop) {
      throw new Error('Airdrop not found');
    }

    // This would integrate with actual blockchain data
    // For now, return a mock result
    const criteriaResults = airdrop.eligibilityCriteria.map(criteria => ({
      type: criteria.type,
      requirement: criteria.requirement,
      met: criteria.met || false,
      value: criteria.value,
    }));

    const metCriteria = criteriaResults.filter(c => c.met).length;
    const totalCriteria = criteriaResults.length;
    const score = totalCriteria > 0 ? (metCriteria / totalCriteria) * 100 : 0;

    return {
      eligible: score >= 50,
      airdropId,
      walletAddress,
      criteriaResults,
      score,
      checkedAt: new Date(),
    };
  }

  async save(airdrop: AirdropEntity): Promise<AirdropEntity> {
    const saved = await this.prisma.airdrop.upsert({
      where: { id: airdrop.id },
      create: this.toPersistence(airdrop),
      update: this.toPersistence(airdrop),
      include: {
        eligibilityCriteria: true,
        metadata: true,
      },
    });

    return this.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.airdrop.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async count(filters?: AirdropFilters): Promise<number> {
    const where: any = {};

    if (filters?.status) {
      where.status = { in: filters.status };
    }

    if (filters?.chainIds) {
      where.chainId = { in: filters.chainIds };
    }

    return this.prisma.airdrop.count({ where });
  }

  private toDomain(raw: any): AirdropEntity {
    return createAirdropEntity({
      id: raw.id,
      name: raw.name,
      protocol: raw.protocol,
      chainId: raw.chainId,
      status: raw.status as AirdropStatus,
      eligibilityCriteria: raw.eligibilityCriteria || [],
      startDate: new Date(raw.startDate),
      endDate: raw.endDate ? new Date(raw.endDate) : undefined,
      totalAllocation: raw.totalAllocation,
      claimedAmount: raw.claimedAmount,
      metadata: raw.metadata || {
        tags: [],
        verified: false,
        featured: false,
      },
    });
  }

  private toPersistence(entity: AirdropEntity): any {
    return {
      id: entity.id,
      name: entity.name,
      protocol: entity.protocol,
      chainId: entity.chainId,
      status: entity.status,
      startDate: entity.startDate,
      endDate: entity.endDate,
      totalAllocation: entity.totalAllocation,
      claimedAmount: entity.claimedAmount,
      eligibilityCriteria: {
        create: entity.eligibilityCriteria,
      },
      metadata: {
        upsert: {
          create: entity.metadata,
          update: entity.metadata,
        },
      },
    };
  }
}

