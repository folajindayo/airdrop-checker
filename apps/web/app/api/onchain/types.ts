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

