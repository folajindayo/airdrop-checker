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

