/**
 * Wallet Type Definitions
 */

export interface IWallet {
  address: string;
  chainId: number;
  balance: string;
  ensName?: string;
}

export interface ITokenBalance {
  tokenAddress: string;
  symbol: string;
  decimals: number;
  balance: string;
  usdValue?: string;
}

export interface IPortfolio {
  address: string;
  chainId: number;
  tokens: ITokenBalance[];
  totalValue: string;
  nfts?: any[];
}

export interface ITransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
}

