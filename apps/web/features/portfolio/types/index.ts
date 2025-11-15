/**
 * Portfolio-related type definitions
 */

export interface PortfolioToken {
  symbol: string;
  balance: number;
  value: number;
  chainId: number;
}

export interface PortfolioSummary {
  totalValue: number;
  tokens: PortfolioToken[];
  change24h: number;
}
