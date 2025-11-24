/**
 * Get Wallet Portfolio Use Case
 * Retrieves comprehensive wallet portfolio information
 */

import { IWalletRepository } from '../repositories/wallet.repository';
import { WalletEntity } from '../entities/wallet.entity';

export interface GetWalletPortfolioRequest {
  walletAddress: string;
  chainId: number;
  includeHistory?: boolean;
}

export interface PortfolioResponse {
  wallet: WalletEntity;
  summary: {
    totalValue: number;
    totalTokens: number;
    totalNFTs: number;
    totalTransactions: number;
  };
  topTokens: Array<{
    symbol: string;
    value: number;
    percentage: number;
  }>;
}

export class GetWalletPortfolioUseCase {
  constructor(private readonly walletRepository: IWalletRepository) {}

  async execute(request: GetWalletPortfolioRequest): Promise<PortfolioResponse> {
    const wallet = await this.walletRepository.findByAddress(
      request.walletAddress,
      request.chainId
    );

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const stats = await this.walletRepository.getStats(
      request.walletAddress,
      request.chainId
    );

    const topTokens = this.calculateTopTokens(wallet);

    return {
      wallet,
      summary: {
        totalValue: stats.totalValue,
        totalTokens: stats.tokenCount,
        totalNFTs: stats.nftCount,
        totalTransactions: stats.transactionCount,
      },
      topTokens,
    };
  }

  private calculateTopTokens(wallet: WalletEntity) {
    const totalValue = wallet.getTotalPortfolioValue();
    
    return wallet.tokenBalances
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((token) => ({
        symbol: token.symbol,
        value: token.value,
        percentage: totalValue > 0 ? (token.value / totalValue) * 100 : 0,
      }));
  }
}


