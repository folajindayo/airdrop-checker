/**
 * Airdrop Repository Implementation (Prisma)
 */

import { IAirdropRepository } from '../../../domain/repositories/airdrop.repository';
import { Airdrop } from '../../../domain/entities/airdrop.entity';
import { PrismaClient } from '@prisma/client';

export class PrismaAirdropRepository implements IAirdropRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Airdrop[]> {
    const airdrops = await this.prisma.airdrop.findMany();
    return airdrops.map(a => new Airdrop(
      a.id,
      a.name,
      a.description,
      a.status,
      a.eligibilityCriteria,
      a.rewardAmount,
      a.startDate,
      a.endDate
    ));
  }

  async findById(id: string): Promise<Airdrop | null> {
    const airdrop = await this.prisma.airdrop.findUnique({
      where: { id },
    });
    
    if (!airdrop) return null;
    
    return new Airdrop(
      airdrop.id,
      airdrop.name,
      airdrop.description,
      airdrop.status,
      airdrop.eligibilityCriteria,
      airdrop.rewardAmount,
      airdrop.startDate,
      airdrop.endDate
    );
  }

  async save(airdrop: Airdrop): Promise<void> {
    await this.prisma.airdrop.upsert({
      where: { id: airdrop.id },
      update: {
        name: airdrop.name,
        description: airdrop.description,
        status: airdrop.status,
        eligibilityCriteria: airdrop.eligibilityCriteria,
        rewardAmount: airdrop.rewardAmount,
        startDate: airdrop.startDate,
        endDate: airdrop.endDate,
      },
      create: {
        id: airdrop.id,
        name: airdrop.name,
        description: airdrop.description,
        status: airdrop.status,
        eligibilityCriteria: airdrop.eligibilityCriteria,
        rewardAmount: airdrop.rewardAmount,
        startDate: airdrop.startDate,
        endDate: airdrop.endDate,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.airdrop.delete({
      where: { id },
    });
  }
}


