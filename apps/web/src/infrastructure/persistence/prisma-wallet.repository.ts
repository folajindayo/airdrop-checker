/**
 * Prisma Wallet Repository Implementation
 */

import { WalletEntity, createWalletEntity } from '../../domain/entities';
import { WalletRepository } from '../../domain/repositories';

export class PrismaWalletRepository implements WalletRepository {
  constructor(private readonly prisma: any) {}

  async findByAddress(
    address: string,
    chainId: number
  ): Promise<WalletEntity | null> {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        address_chainId: {
          address: address.toLowerCase(),
          chainId,
        },
      },
      include: {
        balance: {
          include: {
            tokens: true,
            nfts: true,
          },
        },
        transactions: true,
      },
    });

    if (!wallet) return null;

    return this.toDomain(wallet);
  }

  async save(wallet: WalletEntity): Promise<WalletEntity> {
    const saved = await this.prisma.wallet.upsert({
      where: {
        address_chainId: {
          address: wallet.address,
          chainId: wallet.chainId,
        },
      },
      create: this.toPersistence(wallet),
      update: this.toPersistence(wallet),
      include: {
        balance: {
          include: {
            tokens: true,
            nfts: true,
          },
        },
        transactions: true,
      },
    });

    return this.toDomain(saved);
  }

  async updateBalance(
    address: string,
    chainId: number,
    balance: Partial<WalletEntity['balance']>
  ): Promise<WalletEntity> {
    const wallet = await this.findByAddress(address, chainId);
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const updated = {
      ...wallet,
      balance: {
        ...wallet.balance,
        ...balance,
      },
      lastUpdated: new Date(),
    };

    return this.save(updated);
  }

  async updateTransactions(
    address: string,
    chainId: number,
    transactions: Partial<WalletEntity['transactions']>
  ): Promise<WalletEntity> {
    const wallet = await this.findByAddress(address, chainId);
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const updated = {
      ...wallet,
      transactions: {
        ...wallet.transactions,
        ...transactions,
      },
      lastUpdated: new Date(),
    };

    return this.save(updated);
  }

  async getEligibilityScore(address: string): Promise<number> {
    const wallets = await this.prisma.wallet.findMany({
      where: { address: address.toLowerCase() },
    });

    if (wallets.length === 0) return 0;

    // Calculate average eligibility score across all chains
    const totalScore = wallets.reduce(
      (sum: number, w: any) => sum + (w.eligibilityScore || 0),
      0
    );

    return totalScore / wallets.length;
  }

  async exists(address: string, chainId: number): Promise<boolean> {
    const count = await this.prisma.wallet.count({
      where: {
        address: address.toLowerCase(),
        chainId,
      },
    });

    return count > 0;
  }

  async delete(address: string, chainId: number): Promise<boolean> {
    try {
      await this.prisma.wallet.delete({
        where: {
          address_chainId: {
            address: address.toLowerCase(),
            chainId,
          },
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  private toDomain(raw: any): WalletEntity {
    return {
      address: raw.address,
      chainId: raw.chainId,
      ensName: raw.ensName,
      balance: {
        native: raw.balance?.native || '0',
        tokens: raw.balance?.tokens || [],
        nfts: raw.balance?.nfts || [],
        totalValueUSD: raw.balance?.totalValueUSD || 0,
      },
      transactions: {
        total: raw.transactions?.total || 0,
        incoming: raw.transactions?.incoming || 0,
        outgoing: raw.transactions?.outgoing || 0,
        failed: raw.transactions?.failed || 0,
        firstTransaction: raw.transactions?.firstTransaction,
        lastTransaction: raw.transactions?.lastTransaction,
        mostActiveProtocol: raw.transactions?.mostActiveProtocol,
      },
      eligibilityScore: raw.eligibilityScore || 0,
      connectedAt: new Date(raw.connectedAt),
      lastUpdated: new Date(raw.lastUpdated),
    };
  }

  private toPersistence(entity: WalletEntity): any {
    return {
      address: entity.address,
      chainId: entity.chainId,
      ensName: entity.ensName,
      eligibilityScore: entity.eligibilityScore,
      connectedAt: entity.connectedAt,
      lastUpdated: entity.lastUpdated,
      balance: {
        upsert: {
          create: entity.balance,
          update: entity.balance,
        },
      },
      transactions: {
        upsert: {
          create: entity.transactions,
          update: entity.transactions,
        },
      },
    };
  }
}

