/**
 * Portfolio Entity
 * Represents a user's complete portfolio across chains
 */

export interface PortfolioEntity {
  readonly walletAddress: string;
  readonly chains: ChainPortfolio[];
  readonly totalValueUSD: number;
  readonly lastUpdated: Date;
  readonly performance: PortfolioPerformance;
}

export interface ChainPortfolio {
  chainId: number;
  chainName: string;
  nativeBalance: string;
  nativeValueUSD: number;
  tokens: PortfolioToken[];
  nfts: PortfolioNFT[];
  defiPositions: DefiPosition[];
  totalValueUSD: number;
}

export interface PortfolioToken {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  balanceFormatted: string;
  valueUSD: number;
  priceUSD: number;
  priceChange24h: number;
  allocation: number; // percentage of total portfolio
}

export interface PortfolioNFT {
  contractAddress: string;
  tokenId: string;
  collectionName: string;
  imageUrl?: string;
  floorPriceETH?: number;
  floorPriceUSD?: number;
}

export interface DefiPosition {
  protocol: string;
  type: DefiPositionType;
  chainId: number;
  valueUSD: number;
  apy?: number;
  rewards?: string[];
}

export enum DefiPositionType {
  LENDING = 'lending',
  BORROWING = 'borrowing',
  LIQUIDITY_POOL = 'liquidity_pool',
  STAKING = 'staking',
  FARMING = 'farming',
  VAULT = 'vault',
}

export interface PortfolioPerformance {
  totalGainLossUSD: number;
  totalGainLossPercent: number;
  dailyChangeUSD: number;
  dailyChangePercent: number;
  weeklyChangeUSD: number;
  weeklyChangePercent: number;
  monthlyChangeUSD: number;
  monthlyChangePercent: number;
}

/**
 * Factory to create PortfolioEntity
 */
export function createPortfolioEntity(walletAddress: string): PortfolioEntity {
  return {
    walletAddress: walletAddress.toLowerCase(),
    chains: [],
    totalValueUSD: 0,
    lastUpdated: new Date(),
    performance: {
      totalGainLossUSD: 0,
      totalGainLossPercent: 0,
      dailyChangeUSD: 0,
      dailyChangePercent: 0,
      weeklyChangeUSD: 0,
      weeklyChangePercent: 0,
      monthlyChangeUSD: 0,
      monthlyChangePercent: 0,
    },
  };
}

/**
 * Calculate portfolio allocation percentages
 */
export function calculateAllocations(portfolio: PortfolioEntity): PortfolioEntity {
  const totalValue = portfolio.totalValueUSD;
  
  const updatedChains = portfolio.chains.map(chain => ({
    ...chain,
    tokens: chain.tokens.map(token => ({
      ...token,
      allocation: totalValue > 0 ? (token.valueUSD / totalValue) * 100 : 0,
    })),
  }));

  return {
    ...portfolio,
    chains: updatedChains,
  };
}

