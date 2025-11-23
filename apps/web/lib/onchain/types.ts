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

// Feature 21: Contract gas consumption profiler types
export interface GasProfilingRequest {
  contractAddress: Address;
  functionName: string;
  chainId: number;
}

export interface GasProfile {
  functionName: string;
  gasUsed: number;
  gasLimit: number;
  efficiency: number;
  breakdown: {
    storage: number;
    computation: number;
    external: number;
  };
}

// Feature 22: Token yield curve analyzer types
export interface YieldCurveRequest {
  tokenAddress: Address;
  chainId: number;
  timeframe: '7d' | '30d' | '90d';
}

export interface YieldCurve {
  tokenAddress: Address;
  currentYield: number;
  averageYield: number;
  yieldHistory: {
    timestamp: number;
    yield: number;
  }[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

// Feature 23: Contract function call tracer types
export interface FunctionCallTraceRequest {
  transactionHash: string;
  chainId: number;
}

export interface FunctionCall {
  contractAddress: Address;
  functionName: string;
  args: any[];
  returnValue?: any;
  gasUsed: number;
  depth: number;
}

export interface FunctionCallTrace {
  transactionHash: string;
  calls: FunctionCall[];
  totalCalls: number;
  totalGas: number;
}

// Feature 24: Token holder distribution analyzer types
export interface HolderDistributionRequest {
  tokenAddress: Address;
  chainId: number;
  topN?: number;
}

export interface HolderSegment {
  range: string;
  holders: number;
  percentage: number;
  totalBalance: string;
}

export interface HolderDistribution {
  tokenAddress: Address;
  segments: HolderSegment[];
  giniCoefficient: number;
  topHolders: {
    address: Address;
    balance: string;
    percentage: number;
  }[];
}

// Feature 25: Contract storage slot collision detector types
export interface StorageCollisionRequest {
  contractAddress: Address;
  upgradeAddress: Address;
  chainId: number;
}

export interface StorageCollision {
  slot: number;
  variable: string;
  collisionType: 'overwrite' | 'shift' | 'safe';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface StorageCollisionReport {
  contractAddress: Address;
  upgradeAddress: Address;
  collisions: StorageCollision[];
  hasCollisions: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Feature 26: Token liquidity depth analyzer types
export interface LiquidityDepthRequest {
  tokenAddress: Address;
  chainId: number;
  priceRange?: number;
}

export interface LiquidityDepth {
  price: string;
  liquidity: string;
  depth: number;
}

export interface LiquidityDepthAnalysis {
  tokenAddress: Address;
  depths: LiquidityDepth[];
  averageDepth: number;
  maxDepth: number;
  minDepth: number;
}

// Feature 27: Contract upgrade compatibility checker types
export interface UpgradeCompatibilityRequest {
  currentAddress: Address;
  newAddress: Address;
  chainId: number;
}

export interface CompatibilityIssue {
  type: 'abi' | 'storage' | 'function' | 'event';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface UpgradeCompatibility {
  currentAddress: Address;
  newAddress: Address;
  isCompatible: boolean;
  issues: CompatibilityIssue[];
  compatibilityScore: number;
}

// Feature 28: Token cross-DEX price aggregator types
export interface CrossDEXPriceRequest {
  tokenAddress: Address;
  chainId: number;
  dexes?: string[];
}

export interface DEXPrice {
  dex: string;
  price: string;
  liquidity: string;
  volume24h: string;
}

export interface CrossDEXPrice {
  tokenAddress: Address;
  prices: DEXPrice[];
  averagePrice: string;
  bestPrice: string;
  priceSpread: number;
}

// Feature 29: Contract state transition validator types
export interface StateTransitionRequest {
  contractAddress: Address;
  fromState: string;
  toState: string;
  chainId: number;
}

export interface StateTransition {
  fromState: string;
  toState: string;
  isValid: boolean;
  requiredConditions: string[];
  missingConditions: string[];
}

// Feature 30: Token smart routing optimizer types
export interface SmartRoutingRequest {
  tokenIn: Address;
  tokenOut: Address;
  amountIn: string;
  chainId: number;
  maxHops?: number;
}

export interface RoutingStep {
  dex: string;
  tokenIn: Address;
  tokenOut: Address;
  amountIn: string;
  amountOut: string;
}

export interface SmartRoute {
  steps: RoutingStep[];
  totalAmountOut: string;
  totalGas: number;
  priceImpact: number;
  efficiency: number;
}

// Feature 31: Token wash trading detector types
export interface WashTradingRequest {
  tokenAddress: Address;
  chainId: number;
  timeRange?: number;
}

export interface WashTradingAnalysis {
  tokenAddress: Address;
  isWashTrading: boolean;
  washTradingScore: number;
  suspiciousTransactions: {
    transactionHash: string;
    from: Address;
    to: Address;
    amount: string;
    reason: string;
  }[];
  recommendations: string[];
}

// Feature 32: Contract bytecode similarity analyzer types
export interface BytecodeSimilarityRequest {
  contractA: Address;
  contractB: Address;
  chainId: number;
}

export interface BytecodeSimilarity {
  contractA: Address;
  contractB: Address;
  similarityScore: number;
  matchingFunctions: string[];
  differences: string[];
  isFork: boolean;
}

// Feature 33: Token liquidity provider reward calculator types
export interface LPRewardRequest {
  lpTokenAddress: Address;
  chainId: number;
  timeRange?: number;
}

export interface LPReward {
  lpTokenAddress: Address;
  totalRewards: string;
  apy: number;
  dailyRewards: string;
  rewardToken: Address;
  distributionSchedule: {
    timestamp: number;
    amount: string;
  }[];
}

// Feature 34: Contract function selector analyzer types
export interface FunctionSelectorRequest {
  contractAddress: Address;
  chainId: number;
}

export interface FunctionSelector {
  selector: string;
  functionName: string;
  signature: string;
  isPublic: boolean;
  isPayable: boolean;
}

export interface FunctionSelectorAnalysis {
  contractAddress: Address;
  selectors: FunctionSelector[];
  totalFunctions: number;
  publicFunctions: number;
  payableFunctions: number;
}

// Feature 35: Token tokenomics validator types
export interface TokenomicsRequest {
  tokenAddress: Address;
  chainId: number;
}

export interface TokenomicsValidation {
  tokenAddress: Address;
  isValid: boolean;
  issues: {
    type: 'supply' | 'distribution' | 'burn' | 'mint' | 'tax';
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
  score: number;
  recommendations: string[];
}

// Feature 36: Contract event signature decoder types
export interface EventSignatureRequest {
  eventSignature: string;
  chainId: number;
}

export interface DecodedEvent {
  signature: string;
  name: string;
  parameters: {
    name: string;
    type: string;
    indexed: boolean;
  }[];
  topics: string[];
}

// Feature 37: Token holder activity heatmap types
export interface HolderActivityRequest {
  tokenAddress: Address;
  chainId: number;
  timeframe: '7d' | '30d' | '90d';
}

export interface ActivityHeatmap {
  tokenAddress: Address;
  data: {
    day: number;
    hour: number;
    activity: number;
  }[];
  peakActivity: {
    day: number;
    hour: number;
    count: number;
  };
}

// Feature 38: Contract initialization vulnerability scanner types
export interface InitVulnerabilityRequest {
  contractAddress: Address;
  chainId: number;
}

export interface InitVulnerability {
  contractAddress: Address;
  hasVulnerability: boolean;
  vulnerabilities: {
    type: 'uninitialized' | 'reinitialization' | 'frontrunning';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Feature 39: Token cross-chain arbitrage calculator types
export interface CrossChainArbitrageRequest {
  tokenAddress: Address;
  sourceChainId: number;
  destinationChainId: number;
  amount: string;
}

export interface CrossChainArbitrage {
  tokenAddress: Address;
  sourceChainId: number;
  destinationChainId: number;
  sourcePrice: string;
  destinationPrice: string;
  profit: string;
  profitPercentage: number;
  bridgeCost: string;
  netProfit: string;
  isProfitable: boolean;
}

// Feature 40: Contract gas refund analyzer types
export interface GasRefundRequest {
  transactionHash: string;
  chainId: number;
}

export interface GasRefund {
  transactionHash: string;
  originalGas: number;
  refundedGas: number;
  refundPercentage: number;
  refundReason: string;
  netGasCost: number;
}

// Feature 41: Token transaction pattern analyzer types
export interface TransactionPatternRequest {
  address: Address;
  chainId: number;
  timeRange?: number;
}

export interface TransactionPattern {
  address: Address;
  patterns: {
    type: 'regular' | 'bot' | 'whale' | 'arbitrage' | 'frontrunning';
    confidence: number;
    characteristics: string[];
  }[];
  behaviorScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

// Feature 42: Contract self-destruct detector types
export interface SelfDestructRequest {
  contractAddress: Address;
  chainId: number;
}

export interface SelfDestructAnalysis {
  contractAddress: Address;
  hasSelfDestruct: boolean;
  canSelfDestruct: boolean;
  destructConditions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Feature 43: Token holder retention analyzer types
export interface HolderRetentionRequest {
  tokenAddress: Address;
  chainId: number;
  timeRange?: number;
}

export interface HolderRetention {
  tokenAddress: Address;
  retentionRate: number;
  newHolders: number;
  lostHolders: number;
  averageHoldTime: number;
  retentionTrend: 'increasing' | 'decreasing' | 'stable';
}

// Feature 44: Contract delegatecall vulnerability scanner types
export interface DelegatecallVulnerabilityRequest {
  contractAddress: Address;
  chainId: number;
}

export interface DelegatecallVulnerability {
  contractAddress: Address;
  hasVulnerability: boolean;
  vulnerabilities: {
    functionName: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Feature 45: Token price manipulation detector types
export interface PriceManipulationRequest {
  tokenAddress: Address;
  chainId: number;
  timeRange?: number;
}

export interface PriceManipulation {
  tokenAddress: Address;
  isManipulated: boolean;
  manipulationScore: number;
  suspiciousEvents: {
    timestamp: number;
    type: 'pump' | 'dump' | 'wash';
    description: string;
  }[];
  riskLevel: 'low' | 'medium' | 'high';
}

// Feature 46: Contract upgrade path analyzer types
export interface UpgradePathRequest {
  proxyAddress: Address;
  chainId: number;
}

export interface UpgradePath {
  proxyAddress: Address;
  currentImplementation: Address;
  upgradeHistory: {
    timestamp: number;
    from: Address;
    to: Address;
    reason?: string;
  }[];
  upgradeFrequency: number;
  riskAssessment: 'low' | 'medium' | 'high';
}

// Feature 47: Token liquidity concentration analyzer types
export interface LiquidityConcentrationRequest {
  tokenAddress: Address;
  chainId: number;
}

export interface LiquidityConcentration {
  tokenAddress: Address;
  concentrationScore: number;
  topPools: {
    dex: string;
    liquidity: string;
    percentage: number;
  }[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Feature 48: Contract function visibility analyzer types
export interface FunctionVisibilityRequest {
  contractAddress: Address;
  chainId: number;
}

export interface FunctionVisibility {
  contractAddress: Address;
  publicFunctions: number;
  externalFunctions: number;
  internalFunctions: number;
  privateFunctions: number;
  exposedFunctions: {
    name: string;
    visibility: 'public' | 'external';
    risk: 'low' | 'medium' | 'high';
  }[];
  securityScore: number;
}

// Feature 49: Token transfer velocity calculator types
export interface TransferVelocityRequest {
  tokenAddress: Address;
  chainId: number;
  timeRange?: number;
}

export interface TransferVelocity {
  tokenAddress: Address;
  velocity: number;
  averageTransferSize: string;
  transferFrequency: number;
  velocityTrend: 'increasing' | 'decreasing' | 'stable';
  marketActivity: 'low' | 'medium' | 'high';
}

// Feature 50: Contract storage access pattern analyzer types
export interface StorageAccessRequest {
  contractAddress: Address;
  chainId: number;
}

export interface StorageAccess {
  contractAddress: Address;
  accessPatterns: {
    slot: number;
    readCount: number;
    writeCount: number;
    accessType: 'frequent' | 'moderate' | 'rare';
  }[];
  optimizationOpportunities: string[];
  gasSavings: number;
}

// Feature 51: Token minting schedule analyzer types
export interface MintingScheduleRequest {
  tokenAddress: Address;
  chainId: number;
}

export interface MintingSchedule {
  tokenAddress: Address;
  schedule: {
    timestamp: number;
    amount: string;
    recipient: Address;
    vesting?: boolean;
  }[];
  totalMinted: string;
  remainingMintable: string;
  inflationRate: number;
  nextMint: number;
}

// Feature 52: Contract call depth analyzer types
export interface CallDepthRequest {
  transactionHash: string;
  chainId: number;
}

export interface CallDepth {
  transactionHash: string;
  maxDepth: number;
  callTree: {
    depth: number;
    contract: Address;
    function: string;
    gasUsed: number;
  }[];
  deepCalls: number;
  riskLevel: 'low' | 'medium' | 'high';
}

// Feature 53: Token burn mechanism analyzer types
export interface BurnMechanismRequest {
  tokenAddress: Address;
  chainId: number;
}

export interface BurnMechanism {
  tokenAddress: Address;
  hasBurn: boolean;
  burnType: 'manual' | 'automatic' | 'deflection';
  totalBurned: string;
  burnRate: number;
  deflationary: boolean;
  burnSchedule: {
    timestamp: number;
    amount: string;
  }[];
}

// Feature 54: Contract interface detector types
export interface InterfaceDetectionRequest {
  contractAddress: Address;
  chainId: number;
}

export interface InterfaceDetection {
  contractAddress: Address;
  interfaces: {
    name: string;
    standard: 'ERC20' | 'ERC721' | 'ERC1155' | 'ERC165' | 'custom';
    functions: string[];
    events: string[];
  }[];
  compliance: {
    standard: string;
    compliant: boolean;
    missingFunctions: string[];
  }[];
}

// Feature 55: Token holder migration tracker types
export interface HolderMigrationRequest {
  tokenAddress: Address;
  chainId: number;
  timeRange?: number;
}

export interface HolderMigration {
  tokenAddress: Address;
  migrations: {
    from: Address;
    to: Address;
    amount: string;
    timestamp: number;
    reason?: string;
  }[];
  migrationRate: number;
  topMigrators: Address[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

// Feature 56: Contract fallback function analyzer types
export interface FallbackAnalyzerRequest {
  contractAddress: Address;
  chainId: number;
}

export interface FallbackAnalysis {
  contractAddress: Address;
  hasFallback: boolean;
  hasReceive: boolean;
  isPayable: boolean;
  gasLimit: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Feature 57: Token tax mechanism analyzer types
export interface TaxMechanismRequest {
  tokenAddress: Address;
  chainId: number;
}

export interface TaxMechanism {
  tokenAddress: Address;
  hasTax: boolean;
  buyTax: number;
  sellTax: number;
  transferTax: number;
  taxRecipient: Address;
  exemptions: Address[];
  impact: 'low' | 'medium' | 'high';
}

// Feature 58: Contract event filter builder types
export interface EventFilterRequest {
  contractAddress: Address;
  eventName: string;
  chainId: number;
  filters?: Record<string, any>;
}

export interface EventFilter {
  contractAddress: Address;
  eventName: string;
  filter: {
    topics: string[];
    fromBlock?: number;
    toBlock?: number;
  };
  estimatedMatches: number;
  isValid: boolean;
}

// Feature 59: Token price stability analyzer types
export interface PriceStabilityRequest {
  tokenAddress: Address;
  chainId: number;
  timeRange?: number;
}

export interface PriceStability {
  tokenAddress: Address;
  stabilityScore: number;
  volatility: number;
  priceRange: {
    min: string;
    max: string;
    average: string;
  };
  stabilityTrend: 'improving' | 'deteriorating' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
}

// Feature 60: Contract constructor analyzer types
export interface ConstructorAnalyzerRequest {
  contractAddress: Address;
  chainId: number;
}

export interface ConstructorAnalysis {
  contractAddress: Address;
  hasConstructor: boolean;
  constructorArgs: {
    name: string;
    type: string;
    value: any;
  }[];
  initialization: {
    complete: boolean;
    missing: string[];
  };
  riskLevel: 'low' | 'medium' | 'high';
}

// Feature 61: Token holder concentration risk analyzer types
export interface HolderConcentrationRequest {
  tokenAddress: Address;
  chainId: number;
  topN?: number;
}

export interface HolderConcentration {
  tokenAddress: Address;
  topHoldersPercentage: number;
  concentrationIndex: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  topHolders: {
    address: Address;
    balance: string;
    percentage: number;
  }[];
  recommendations: string[];
}

// Feature 62: Contract gas optimization opportunity finder types
export interface GasOptimizationOpportunityRequest {
  contractAddress: Address;
  chainId: number;
}

export interface GasOptimizationOpportunity {
  contractAddress: Address;
  opportunities: {
    type: 'storage' | 'computation' | 'external' | 'loop';
    description: string;
    currentGas: number;
    optimizedGas: number;
    savings: number;
    priority: 'low' | 'medium' | 'high';
  }[];
  totalPotentialSavings: number;
}

// Feature 63: Token liquidity pool health monitor types
export interface LiquidityPoolHealthRequest {
  poolAddress: Address;
  chainId: number;
}

export interface LiquidityPoolHealth {
  poolAddress: Address;
  healthScore: number;
  metrics: {
    liquidity: string;
    volume24h: string;
    fees24h: string;
    utilization: number;
    impermanentLoss: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Feature 64: Contract time-lock analyzer types
export interface TimelockAnalyzerRequest {
  contractAddress: Address;
  chainId: number;
}

export interface TimelockAnalysis {
  contractAddress: Address;
  hasTimelock: boolean;
  timelockDuration: number;
  pendingActions: {
    action: string;
    executeTime: number;
    proposer: Address;
  }[];
  securityLevel: 'low' | 'medium' | 'high';
}

// Feature 65: Token trading volume analyzer types
export interface TradingVolumeRequest {
  tokenAddress: Address;
  chainId: number;
  timeframe: '24h' | '7d' | '30d';
}

export interface TradingVolume {
  tokenAddress: Address;
  volume: string;
  volumeChange: number;
  averageVolume: string;
  volumeDistribution: {
    hour: number;
    volume: string;
  }[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

// Feature 66: Contract multi-sig threshold analyzer types
export interface MultisigThresholdRequest {
  multisigAddress: Address;
  chainId: number;
}

export interface MultisigThreshold {
  multisigAddress: Address;
  threshold: number;
  totalSigners: number;
  pendingTransactions: number;
  securityLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Feature 67: Token holder behavior profiler types
export interface HolderBehaviorRequest {
  tokenAddress: Address;
  chainId: number;
  timeRange?: number;
}

export interface HolderBehavior {
  tokenAddress: Address;
  behaviors: {
    type: 'hodler' | 'trader' | 'whale' | 'bot';
    count: number;
    percentage: number;
    characteristics: string[];
  }[];
  dominantBehavior: string;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
}

// Feature 68: Contract storage optimization analyzer types
export interface StorageOptimizationRequest {
  contractAddress: Address;
  chainId: number;
}

export interface StorageOptimization {
  contractAddress: Address;
  currentSlots: number;
  optimizedSlots: number;
  potentialSavings: number;
  optimizations: {
    slot: number;
    currentLayout: string;
    optimizedLayout: string;
    savings: number;
  }[];
}

// Feature 69: Token price oracle aggregator types
export interface PriceOracleRequest {
  tokenAddress: Address;
  chainId: number;
  oracles?: string[];
}

export interface PriceOracle {
  tokenAddress: Address;
  prices: {
    oracle: string;
    price: string;
    lastUpdate: number;
    confidence: number;
  }[];
  aggregatedPrice: string;
  priceDeviation: number;
  reliability: 'low' | 'medium' | 'high';
}

// Feature 70: Contract event log analyzer types
export interface EventLogRequest {
  contractAddress: Address;
  eventName: string;
  chainId: number;
  fromBlock?: number;
  toBlock?: number;
}

export interface EventLog {
  contractAddress: Address;
  eventName: string;
  totalEvents: number;
  events: {
    blockNumber: number;
    transactionHash: string;
    args: any;
    timestamp: number;
  }[];
  frequency: number;
  patterns: string[];
}

// Feature 71: Token supply inflation tracker types
export interface SupplyInflationRequest {
  tokenAddress: Address;
  chainId: number;
  timeRange?: number;
}

export interface SupplyInflation {
  tokenAddress: Address;
  currentSupply: string;
  inflationRate: number;
  projectedSupply: string;
  inflationHistory: {
    timestamp: number;
    supply: string;
    inflationRate: number;
  }[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

// Feature 72: Contract access pattern analyzer types
export interface AccessPatternRequest {
  contractAddress: Address;
  chainId: number;
  timeRange?: number;
}

export interface AccessPattern {
  contractAddress: Address;
  accessFrequency: {
    function: string;
    callCount: number;
    uniqueCallers: number;
    averageGas: number;
  }[];
  mostAccessed: string;
  accessTrend: 'increasing' | 'decreasing' | 'stable';
}

// Feature 73: Token holder distribution Gini coefficient calculator types
export interface GiniCoefficientRequest {
  tokenAddress: Address;
  chainId: number;
}

export interface GiniCoefficient {
  tokenAddress: Address;
  giniCoefficient: number;
  interpretation: 'equal' | 'moderate' | 'unequal' | 'extreme';
  percentileDistribution: {
    percentile: number;
    balance: string;
    percentage: number;
  }[];
  recommendations: string[];
}

// Feature 74: Contract upgrade safety checker types
export interface UpgradeSafetyRequest {
  currentAddress: Address;
  newAddress: Address;
  chainId: number;
}

export interface UpgradeSafety {
  currentAddress: Address;
  newAddress: Address;
  isSafe: boolean;
  safetyScore: number;
  risks: {
    type: 'storage' | 'function' | 'event' | 'interface';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }[];
  recommendations: string[];
}

// Feature 75: Token market maker activity detector types
export interface MarketMakerRequest {
  tokenAddress: Address;
  chainId: number;
  timeRange?: number;
}

export interface MarketMaker {
  tokenAddress: Address;
  hasMarketMaker: boolean;
  marketMakerAddresses: Address[];
  activity: {
    address: Address;
    buyVolume: string;
    sellVolume: string;
    spread: number;
    frequency: number;
  }[];
  impact: 'low' | 'medium' | 'high';
}

// Feature 76: Contract function gas cost estimator types
export interface FunctionGasEstimateRequest {
  contractAddress: Address;
  functionName: string;
  args: any[];
  chainId: number;
}

export interface FunctionGasEstimate {
  contractAddress: Address;
  functionName: string;
  estimatedGas: number;
  gasBreakdown: {
    base: number;
    storage: number;
    computation: number;
    external: number;
  };
  optimizationTips: string[];
}

// Feature 77: Token holder age distribution analyzer types
export interface HolderAgeRequest {
  tokenAddress: Address;
  chainId: number;
}

export interface HolderAge {
  tokenAddress: Address;
  distribution: {
    ageRange: string;
    holders: number;
    percentage: number;
    averageBalance: string;
  }[];
  averageAge: number;
  oldestHolder: Address;
  newestHolder: Address;
}

// Feature 78: Contract dependency graph builder types
export interface DependencyGraphRequest {
  contractAddress: Address;
  chainId: number;
  depth?: number;
}

export interface DependencyGraph {
  contractAddress: Address;
  nodes: {
    address: Address;
    type: 'contract' | 'library' | 'interface';
    functions: string[];
  }[];
  edges: {
    from: Address;
    to: Address;
    relationship: 'imports' | 'inherits' | 'calls';
  }[];
  complexity: 'low' | 'medium' | 'high';
}

// Feature 79: Token transaction fee analyzer types
export interface TransactionFeeRequest {
  tokenAddress: Address;
  chainId: number;
  timeRange?: number;
}

export interface TransactionFee {
  tokenAddress: Address;
  averageFee: string;
  feeDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  totalFees: string;
  feeTrend: 'increasing' | 'decreasing' | 'stable';
}

// Feature 80: Contract security best practices checker types
export interface SecurityBestPracticesRequest {
  contractAddress: Address;
  chainId: number;
}

export interface SecurityBestPractices {
  contractAddress: Address;
  score: number;
  checks: {
    practice: string;
    passed: boolean;
    severity: 'low' | 'medium' | 'high';
    recommendation?: string;
  }[];
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
}

