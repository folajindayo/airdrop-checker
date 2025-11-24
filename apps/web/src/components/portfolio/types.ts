/**
 * Portfolio Component Type Definitions
 * 
 * Shared types for portfolio-related components
 */

export interface PortfolioToken {
  symbol: string;
  name: string;
  balance: string;
  valueUSD: number;
  contractAddress: string;
  chain: string;
  logoUrl?: string;
  priceChange24h?: number;
}

export interface PortfolioChain {
  chainId: number;
  chainName: string;
  value: number;
  tokens: PortfolioToken[];
}

export interface PortfolioData {
  address: string;
  totalValue: number;
  chains: PortfolioChain[];
  timestamp: string;
  cached?: boolean;
}

export interface GasData {
  address: string;
  totalSpent: number;
  totalTransactions: number;
  averageGasPrice: number;
  chains: Array<{
    chainId: number;
    chainName: string;
    gasSpent: number;
    transactionCount: number;
    averageGasPrice: number;
  }>;
}

export interface ProtocolInsight {
  protocol: string;
  tvl: number;
  userBalance: number;
  apy: number;
  risk: 'low' | 'medium' | 'high';
  category: string;
}

export interface RebalanceSuggestion {
  from: {
    token: string;
    amount: number;
  };
  to: {
    token: string;
    amount: number;
  };
  reason: string;
  expectedGain?: number;
}

export interface WalletHealth {
  score: number;
  diversification: number;
  activityLevel: number;
  riskLevel: number;
  suggestions: string[];
}

