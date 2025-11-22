/**
 * TypeScript types for onchain features
 * All types support Reown Wallet integration
 */

import { Address } from 'viem';

export interface OnchainTransactionRequest {
  from: Address;
  to: Address;
  value?: string;
  data?: string;
  chainId: number;
}

export interface TokenTransferRequest {
  from: Address;
  to: Address;
  amount: string;
  tokenAddress?: Address;
  chainId: number;
  decimals?: number;
}

export interface TokenApprovalRequest {
  tokenAddress: Address;
  spender: Address;
  amount?: string;
  chainId: number;
  unlimited?: boolean;
  decimals?: number;
}

export interface NFTTransferRequest {
  contractAddress: Address;
  from: Address;
  to: Address;
  tokenId: string;
  chainId: number;
  safeTransfer?: boolean;
}

export interface StakingRequest {
  stakingContract: Address;
  amount: string;
  chainId: number;
  tokenAddress?: Address;
  decimals?: number;
}

export interface SwapRequest {
  routerAddress: Address;
  tokenIn: Address;
  tokenOut: Address;
  amountIn: string;
  amountOutMin?: string;
  chainId: number;
  recipient?: Address;
  decimalsIn?: number;
  decimalsOut?: number;
}

export interface GasEstimationRequest {
  from: Address;
  to: Address;
  value?: string;
  data?: string;
  chainId: number;
}

export interface ContractReadRequest {
  contractAddress: Address;
  abi: any[];
  functionName: string;
  args?: any[];
  chainId: number;
}

export interface EventListeningRequest {
  contractAddress: Address;
  abi: any[];
  eventName: string;
  fromBlock?: string;
  toBlock?: string;
  chainId: number;
  args?: any;
}

export interface OnchainResponse {
  success: boolean;
  transaction?: any;
  data?: any;
  error?: string;
  type: string;
  message?: string;
}

// Feature 1: Cross-chain token balance aggregator types
export interface CrossChainBalanceRequest {
  address: Address;
  tokenAddress?: Address;
  chainIds: number[];
}

export interface ChainBalance {
  chainId: number;
  chainName: string;
  balance: string;
  balanceFormatted: string;
  tokenAddress?: Address;
  tokenSymbol?: string;
  decimals: number;
}

export interface CrossChainBalanceResponse {
  address: Address;
  totalBalance: string;
  totalBalanceFormatted: string;
  balances: ChainBalance[];
  chainCount: number;
  tokenAddress?: Address;
}

// Feature 2: MEV protection analyzer types
export interface MEVProtectionRequest {
  transactionHash: string;
  chainId: number;
}

export interface MEVProtectionAnalysis {
  transactionHash: string;
  isProtected: boolean;
  protectionLevel: 'none' | 'low' | 'medium' | 'high';
  detectedMEV: boolean;
  mevType?: 'frontrunning' | 'backrunning' | 'sandwich' | 'arbitrage';
  riskScore: number;
  recommendations: string[];
  gasPriceAnalysis: {
    current: string;
    average: string;
    premium: string;
  };
}

// Feature 3: Token rug pull detector types
export interface RugPullDetectionRequest {
  tokenAddress: Address;
  chainId: number;
}

export interface RugPullAnalysis {
  tokenAddress: Address;
  isRugPull: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: {
    liquidityLocked: boolean;
    ownershipRenounced: boolean;
    contractVerified: boolean;
    hasTax: boolean;
    highOwnership: boolean;
    suspiciousActivity: boolean;
  };
  riskScore: number;
  recommendations: string[];
}

// Feature 4: Smart contract dependency mapper types
export interface ContractDependencyRequest {
  contractAddress: Address;
  chainId: number;
  depth?: number;
}

export interface ContractDependency {
  address: Address;
  type: 'contract' | 'library' | 'interface';
  relationship: 'imports' | 'inherits' | 'calls' | 'stores';
  depth: number;
}

export interface ContractDependencyMap {
  contractAddress: Address;
  dependencies: ContractDependency[];
  totalDependencies: number;
  maxDepth: number;
}

// Feature 5: Gas optimization advisor types
export interface GasOptimizationRequest {
  contractAddress: Address;
  functionName: string;
  args: any[];
  chainId: number;
}

export interface GasOptimization {
  suggestion: string;
  currentGas: number;
  estimatedSavings: number;
  priority: 'low' | 'medium' | 'high';
  implementation: string;
}

export interface GasOptimizationReport {
  contractAddress: Address;
  functionName: string;
  currentGasEstimate: number;
  optimizations: GasOptimization[];
  totalPotentialSavings: number;
}

// Feature 6: Token liquidity migration tracker types
export interface LiquidityMigrationRequest {
  tokenAddress: Address;
  chainId: number;
  timeRange?: number;
}

export interface LiquidityMigration {
  fromDex: string;
  toDex: string;
  amount: string;
  timestamp: number;
  transactionHash: string;
}

export interface LiquidityMigrationReport {
  tokenAddress: Address;
  migrations: LiquidityMigration[];
  totalMigrations: number;
  netLiquidityChange: string;
  topDestination: string;
}

// Feature 7: Contract upgrade risk analyzer types
export interface UpgradeRiskRequest {
  proxyAddress: Address;
  chainId: number;
}

export interface UpgradeRiskAnalysis {
  proxyAddress: Address;
  implementationAddress: Address;
  riskLevel: 'low' | 'medium' | 'high';
  risks: {
    hasTimelock: boolean;
    hasMultisig: boolean;
    upgradeFrequency: number;
    lastUpgrade: number;
  };
  recommendations: string[];
}

// Feature 8: Token pair correlation analyzer types
export interface PairCorrelationRequest {
  tokenA: Address;
  tokenB: Address;
  chainId: number;
  timeframe: '24h' | '7d' | '30d';
}

export interface PairCorrelation {
  tokenA: Address;
  tokenB: Address;
  correlationCoefficient: number;
  priceMovement: {
    tokenA: number;
    tokenB: number;
  };
  tradingVolume: {
    tokenA: string;
    tokenB: string;
  };
}

// Feature 9: Flash loan attack detector types
export interface FlashLoanAttackRequest {
  transactionHash: string;
  chainId: number;
}

export interface FlashLoanAttackAnalysis {
  transactionHash: string;
  isFlashLoanAttack: boolean;
  attackType?: 'arbitrage' | 'liquidation' | 'price-manipulation';
  flashLoanAmount: string;
  profit: string;
  protocols: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

// Feature 10: Token migration path finder types
export interface MigrationPathRequest {
  fromToken: Address;
  toToken: Address;
  amount: string;
  chainId: number;
}

export interface MigrationPath {
  steps: {
    action: 'swap' | 'bridge' | 'wrap';
    from: Address;
    to: Address;
    amount: string;
    dex?: string;
  }[];
  totalCost: string;
  estimatedGas: number;
  bestRoute: boolean;
}

// Feature 11: Contract storage layout analyzer types
export interface StorageLayoutRequest {
  contractAddress: Address;
  chainId: number;
}

export interface StorageSlot {
  slot: number;
  variable: string;
  type: string;
  offset: number;
  size: number;
}

export interface StorageLayout {
  contractAddress: Address;
  slots: StorageSlot[];
  totalSlots: number;
  packedSlots: number;
}

// Feature 12: Token arbitrage opportunity finder types
export interface ArbitrageOpportunityRequest {
  tokenA: Address;
  tokenB: Address;
  chainIds: number[];
  minProfit?: string;
}

export interface ArbitrageOpportunity {
  chainId: number;
  dexA: string;
  dexB: string;
  tokenA: Address;
  tokenB: Address;
  buyPrice: string;
  sellPrice: string;
  profit: string;
  profitPercentage: number;
  estimatedGas: number;
}

// Feature 13: Contract proxy pattern detector types
export interface ProxyPatternRequest {
  contractAddress: Address;
  chainId: number;
}

export interface ProxyPattern {
  contractAddress: Address;
  isProxy: boolean;
  proxyType?: 'transparent' | 'uups' | 'beacon' | 'minimal';
  implementationAddress?: Address;
  adminAddress?: Address;
  hasTimelock: boolean;
}

// Feature 14: Token cross-chain bridge risk analyzer types
export interface BridgeRiskRequest {
  tokenAddress: Address;
  sourceChainId: number;
  destinationChainId: number;
  amount: string;
}

export interface BridgeRiskAnalysis {
  tokenAddress: Address;
  sourceChainId: number;
  destinationChainId: number;
  riskLevel: 'low' | 'medium' | 'high';
  risks: {
    bridgeSecurity: number;
    liquidityRisk: number;
    slippageRisk: number;
    timeRisk: number;
  };
  recommendations: string[];
}

// Feature 15: Contract reentrancy vulnerability scanner types
export interface ReentrancyScanRequest {
  contractAddress: Address;
  chainId: number;
}

export interface ReentrancyVulnerability {
  functionName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

export interface ReentrancyScanReport {
  contractAddress: Address;
  vulnerabilities: ReentrancyVulnerability[];
  hasReentrancy: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Feature 16: Token price impact calculator types
export interface PriceImpactRequest {
  tokenAddress: Address;
  amount: string;
  chainId: number;
  dex?: string;
}

export interface PriceImpact {
  tokenAddress: Address;
  amount: string;
  priceImpact: number;
  priceImpactPercentage: number;
  executionPrice: string;
  averagePrice: string;
  slippage: number;
}

// Feature 17: Contract access control analyzer types
export interface AccessControlRequest {
  contractAddress: Address;
  chainId: number;
}

export interface AccessControlRole {
  role: string;
  members: Address[];
  adminRole?: string;
}

export interface AccessControlAnalysis {
  contractAddress: Address;
  roles: AccessControlRole[];
  hasAccessControl: boolean;
  securityLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Feature 18: Token impermanent loss calculator types
export interface ImpermanentLossRequest {
  tokenA: Address;
  tokenB: Address;
  amountA: string;
  amountB: string;
  chainId: number;
  timeRange: number;
}

export interface ImpermanentLoss {
  tokenA: Address;
  tokenB: Address;
  initialValue: string;
  hodlValue: string;
  lpValue: string;
  impermanentLoss: string;
  impermanentLossPercentage: number;
  breakEvenPrice: string;
}

// Feature 19: Contract event emission tracker types
export interface EventEmissionRequest {
  contractAddress: Address;
  eventName: string;
  chainId: number;
  fromBlock?: number;
  toBlock?: number;
}

export interface EventEmission {
  eventName: string;
  blockNumber: number;
  transactionHash: string;
  args: any;
  timestamp: number;
}

export interface EventEmissionReport {
  contractAddress: Address;
  eventName: string;
  emissions: EventEmission[];
  totalEmissions: number;
  frequency: number;
}

// Feature 20: Token slippage protection optimizer types
export interface SlippageProtectionRequest {
  tokenIn: Address;
  tokenOut: Address;
  amountIn: string;
  chainId: number;
  maxSlippage: number;
}

export interface SlippageProtection {
  optimalSlippage: number;
  recommendedSlippage: number;
  estimatedSlippage: number;
  protectionLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

