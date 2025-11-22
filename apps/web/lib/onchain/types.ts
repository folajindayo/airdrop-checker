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

