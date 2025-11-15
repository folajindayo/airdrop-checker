// Onchain API types
export interface ChainInfo {
  id: number;
  name: string;
}

export interface GasPrice {
  chainId: number;
  price: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

export interface LiquidityRoute {
  dex: string;
  estimatedGas: number;
  priceImpact: string;
}

export interface MEVDetection {
  detected: boolean;
  type: string;
  probability: number;
}

export interface WalletMetrics {
  diversityScore: number;
  activityScore: number;
  riskLevel: string;
}

export interface CorrelationData {
  token1: string;
  token2: string;
  coefficient: number;
}

export interface SupplyMetrics {
  total: string;
  circulating: string;
  locked: string;
}

