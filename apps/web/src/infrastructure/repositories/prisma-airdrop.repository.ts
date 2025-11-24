/**
 * Prisma Airdrop Repository Implementation
 * Concrete implementation using Prisma ORM
 */

import { PrismaClient } from '@prisma/client';
import {
  IAirdropRepository,
  AirdropFilters,
  PaginationParams,
  PaginatedResult,
} from '../../domain/repositories/airdrop.repository';
import { AirdropEntity, AirdropStatus } from '../../domain/entities/airdrop.entity';

export class PrismaAirdropRepository implements IAirdropRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<AirdropEntity | null> {
    const airdrop = await this.prisma.airdrop.findUnique({
      where: { id },
      include: { eligibilityCriteria: true },
    });

    if (!airdrop) {
      return null;
    }

    return this.toDomain(airdrop);
  }

  async find(
    filters: AirdropFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<AirdropEntity>> {
    const where = this.buildWhereClause(filters);
    const skip = (pagination.page - 1) * pagination.limit;

    const [items, total] = await Promise.all([
      this.prisma.airdrop.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: {
          [pagination.sortBy || 'startDate']: pagination.sortOrder || 'desc',
        },
        include: { eligibilityCriteria: true },
      }),
      this.prisma.airdrop.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toDomain(item)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findActive(): Promise<AirdropEntity[]> {
    const now = new Date();
    
    const airdrops = await this.prisma.airdrop.findMany({
      where: {
        status: 'active',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { eligibilityCriteria: true },
    });

    return airdrops.map((airdrop) => this.toDomain(airdrop));
  }

  async findByChainId(chainId: number): Promise<AirdropEntity[]> {
    const airdrops = await this.prisma.airdrop.findMany({
      where: { chainId },
      include: { eligibilityCriteria: true },
    });

    return airdrops.map((airdrop) => this.toDomain(airdrop));
  }

  async findEligibleForWallet(walletAddress: string): Promise<AirdropEntity[]> {
    // This would require joining with eligibility checks
    const airdrops = await this.prisma.airdrop.findMany({
      where: {
        status: 'active',
        NOT: {
          claims: {
            some: {
              walletAddress: walletAddress.toLowerCase(),
            },
          },
        },
      },
      include: { eligibilityCriteria: true },
    });

    return airdrops.map((airdrop) => this.toDomain(airdrop));
  }

  async findUpcoming(limit?: number): Promise<AirdropEntity[]> {
    const airdrops = await this.prisma.airdrop.findMany({
      where: {
        status: 'upcoming',
        startDate: { gt: new Date() },
      },
      take: limit,
      orderBy: { startDate: 'asc' },
      include: { eligibilityCriteria: true },
    });

    return airdrops.map((airdrop) => this.toDomain(airdrop));
  }

  async create(airdrop: AirdropEntity): Promise<AirdropEntity> {
    const created = await this.prisma.airdrop.create({
      data: this.toData(airdrop),
      include: { eligibilityCriteria: true },
    });

    return this.toDomain(created);
  }

  async update(id: string, airdrop: AirdropEntity): Promise<AirdropEntity> {
    const updated = await this.prisma.airdrop.update({
      where: { id },
      data: this.toData(airdrop),
      include: { eligibilityCriteria: true },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.airdrop.delete({
      where: { id },
    });
  }

  async count(filters: AirdropFilters): Promise<number> {
    return await this.prisma.airdrop.count({
      where: this.buildWhereClause(filters),
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.airdrop.count({
      where: { id },
    });
    return count > 0;
  }

  async findByContractAddress(contractAddress: string): Promise<AirdropEntity[]> {
    const airdrops = await this.prisma.airdrop.findMany({
      where: { contractAddress: contractAddress.toLowerCase() },
      include: { eligibilityCriteria: true },
    });

    return airdrops.map((airdrop) => this.toDomain(airdrop));
  }

  async bulkCreate(airdrops: AirdropEntity[]): Promise<AirdropEntity[]> {
    const created = await this.prisma.$transaction(
      airdrops.map((airdrop) =>
        this.prisma.airdrop.create({
          data: this.toData(airdrop),
          include: { eligibilityCriteria: true },
        })
      )
    );

    return created.map((airdrop) => this.toDomain(airdrop));
  }

  async markAsClaimed(airdropId: string, walletAddress: string): Promise<void> {
    await this.prisma.airdropClaim.create({
      data: {
        airdropId,
        walletAddress: walletAddress.toLowerCase(),
        claimedAt: new Date(),
      },
    });
  }

  private buildWhereClause(filters: AirdropFilters): any {
    const where: any = {};

    if (filters.chainId) {
      where.chainId = filters.chainId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.minAmount) {
      where.totalAmount = { gte: filters.minAmount.toString() };
    }

    if (filters.startDate || filters.endDate) {
      where.startDate = {};
      if (filters.startDate) {
        where.startDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.startDate.lte = filters.endDate;
      }
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { symbol: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private toDomain(data: any): AirdropEntity {
    return AirdropEntity.create({
      id: data.id,
      name: data.name,
      symbol: data.symbol,
      totalAmount: BigInt(data.totalAmount),
      claimAmount: BigInt(data.claimAmount),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      chainId: data.chainId,
      contractAddress: data.contractAddress,
      status: data.status as AirdropStatus,
      eligibilityCriteria: data.eligibilityCriteria || [],
      metadata: data.metadata,
    });
  }

  private toData(entity: AirdropEntity): any {
    return {
      id: entity.id,
      name: entity.name,
      symbol: entity.symbol,
      totalAmount: entity.totalAmount.toString(),
      claimAmount: entity.claimAmount.toString(),
      startDate: entity.startDate,
      endDate: entity.endDate,
      chainId: entity.chainId,
      contractAddress: entity.contractAddress.toLowerCase(),
      status: entity.status,
      metadata: entity.metadata,
    };
  }
}


