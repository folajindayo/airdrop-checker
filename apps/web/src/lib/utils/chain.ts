/**
 * Blockchain chain utility functions
 */

export interface Chain {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const CHAINS: Record<string, Chain> = {
  ethereum: {
    id: 1,
    name: "Ethereum",
    symbol: "ETH",
    rpcUrl: "https://eth.llamarpc.com",
    blockExplorer: "https://etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  polygon: {
    id: 137,
    name: "Polygon",
    symbol: "MATIC",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  bsc: {
    id: 56,
    name: "BNB Chain",
    symbol: "BNB",
    rpcUrl: "https://bsc-dataseed.binance.org",
    blockExplorer: "https://bscscan.com",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
  },
  arbitrum: {
    id: 42161,
    name: "Arbitrum",
    symbol: "ARB",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  optimism: {
    id: 10,
    name: "Optimism",
    symbol: "OP",
    rpcUrl: "https://mainnet.optimism.io",
    blockExplorer: "https://optimistic.etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
};

export function getChainById(chainId: number): Chain | undefined {
  return Object.values(CHAINS).find((chain) => chain.id === chainId);
}

export function getChainByName(name: string): Chain | undefined {
  return CHAINS[name.toLowerCase()];
}

export function isValidChainId(chainId: number): boolean {
  return Object.values(CHAINS).some((chain) => chain.id === chainId);
}

export function getChainName(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.name || "Unknown Chain";
}

export function getBlockExplorerUrl(chainId: number, hash: string, type: "tx" | "address" = "tx"): string {
  const chain = getChainById(chainId);
  if (!chain) return "";
  
  const path = type === "tx" ? "tx" : "address";
  return `${chain.blockExplorer}/${path}/${hash}`;
}

export function formatChainAmount(amount: string | number, decimals: number = 18): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return (num / Math.pow(10, decimals)).toFixed(6);
}

export function parseChainAmount(amount: string | number, decimals: number = 18): bigint {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return BigInt(Math.floor(num * Math.pow(10, decimals)));
}

