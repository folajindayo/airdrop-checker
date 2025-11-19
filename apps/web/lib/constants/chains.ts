/**
 * Blockchain Chain Configurations
 * Supported chains and their properties
 */

export interface Chain {
  id: number;
  name: string;
  displayName: string;
  symbol: string;
  decimals: number;
  rpcUrl: string;
  blockExplorer: string;
  iconUrl?: string;
}

export const CHAINS: Record<number, Chain> = {
  1: {
    id: 1,
    name: "ethereum",
    displayName: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    rpcUrl: "https://eth.llamarpc.com",
    blockExplorer: "https://etherscan.io",
  },
  137: {
    id: 137,
    name: "polygon",
    displayName: "Polygon",
    symbol: "MATIC",
    decimals: 18,
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
  },
  56: {
    id: 56,
    name: "bsc",
    displayName: "BNB Chain",
    symbol: "BNB",
    decimals: 18,
    rpcUrl: "https://bsc-dataseed.binance.org",
    blockExplorer: "https://bscscan.com",
  },
  42161: {
    id: 42161,
    name: "arbitrum",
    displayName: "Arbitrum One",
    symbol: "ETH",
    decimals: 18,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io",
  },
  10: {
    id: 10,
    name: "optimism",
    displayName: "Optimism",
    symbol: "ETH",
    decimals: 18,
    rpcUrl: "https://mainnet.optimism.io",
    blockExplorer: "https://optimistic.etherscan.io",
  },
};

export const SUPPORTED_CHAIN_IDS = Object.keys(CHAINS).map(Number);
export const DEFAULT_CHAIN_ID = 1;

export function getChain(chainId: number): Chain | undefined {
  return CHAINS[chainId];
}

export function isChainSupported(chainId: number): boolean {
  return chainId in CHAINS;
}

export function getBlockExplorerUrl(
  chainId: number,
  type: "tx" | "address" | "token",
  value: string
): string {
  const chain = getChain(chainId);
  if (!chain) return "";

  const paths = {
    tx: "tx",
    address: "address",
    token: "token",
  };

  return `${chain.blockExplorer}/${paths[type]}/${value}`;
}
