/**
 * Type definitions for new onchain features (738-767)
 * All features integrate with Reown Wallet for secure transactions
 */

export interface SecurityScanResult {
  isContract: boolean;
  vulnerabilities: string[];
  riskScore: number;
  recommendations: string[];
}

export interface HolderSnapshot {
  totalSupply: string;
  holders: Array<{
    address: string;
    balance: string;
  }>;
  timestamp: string;
}

export interface PoolHealthMetrics {
  liquidity: string;
  healthScore: number;
  impermanentLossRisk: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface YieldFarmingPosition {
  protocol: string;
  tokenPair: string;
  amount: string;
  apy: number;
  rewards: string;
}

export interface ArbitrageOpportunity {
  chainId: number;
  tokenAddress: string;
  priceDifference: number;
  estimatedProfit: string;
  route: string[];
}

export interface HolderActivityScore {
  activityScore: number;
  transactionCount: number;
  activityLevel: 'low' | 'medium' | 'high';
}

export interface MarketCapData {
  totalSupply: string;
  price: string;
  marketCap: string;
  fullyDiluted: string;
}

export interface VolumeAnalysis {
  dailyVolume: string;
  weeklyVolume: string;
  monthlyVolume: string;
  volumeTrend: string;
}

export interface LiquidityMetrics {
  totalLiquidity: string;
  liquidityDepth: string;
  marketMakerActivity: string;
  liquidityScore: number;
}

export interface GovernanceData {
  proposals: any[];
  votes: any[];
  votingPower: number;
  participationRate: number;
}

export interface ValidatorRewards {
  totalRewards: string;
  epochRewards: string;
  apy: number;
  performance: string;
}

export interface TimelockQueue {
  pendingActions: any[];
  delay: number;
  nextExecution: string | null;
  queueLength: number;
}

export interface ProxyUpgrade {
  isProxy: boolean;
  upgradeHistory: any[];
  currentImplementation: string | null;
  lastUpgrade: string | null;
}

export interface AccountAbstraction {
  isSmartWallet: boolean;
  usagePatterns: any[];
  transactionCount: number;
  abstractionType: string;
}

export interface ContractAnalysis {
  bytecodeSize: number;
  functionCount: number;
  eventCount: number;
  complexity: number;
}

export interface HolderSegmentation {
  whales: any[];
  dolphins: any[];
  fish: any[];
  segments: {
    whale: { count: number; percentage: number };
    dolphin: { count: number; percentage: number };
    fish: { count: number; percentage: number };
  };
}

