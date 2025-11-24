/**
 * Portfolio Service
 */

export interface PortfolioToken {
  address: string;
  symbol: string;
  balance: string;
  value: number;
}

export class PortfolioService {
  async getPortfolio(walletAddress: string): Promise<PortfolioToken[]> {
    const response = await fetch(`/api/portfolio?address=${walletAddress}`);
    if (!response.ok) throw new Error('Failed to fetch portfolio');
    return response.json();
  }

  async getTotalValue(walletAddress: string): Promise<number> {
    const tokens = await this.getPortfolio(walletAddress);
    return tokens.reduce((sum, token) => sum + token.value, 0);
  }
}
