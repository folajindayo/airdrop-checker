/**
 * Supported blockchain networks
 */

export interface Chain {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorers?: {
    name: string;
    url: string;
  }[];
  goldrushName: string;
}

export const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://eth.llamarpc.com'],
    blockExplorers: [
      {
        name: 'Etherscan',
        url: 'https://etherscan.io',
      },
    ],
    goldrushName: 'eth-mainnet',
  },
  {
    id: 8453,
    name: 'Base',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorers: [
      {
        name: 'Basescan',
        url: 'https://basescan.org',
      },
    ],
    goldrushName: 'base-mainnet',
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorers: [
      {
        name: 'Arbiscan',
        url: 'https://arbiscan.io',
      },
    ],
    goldrushName: 'arbitrum-mainnet',
  },
  {
    id: 10,
    name: 'Optimism',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorers: [
      {
        name: 'Optimistic Etherscan',
        url: 'https://optimistic.etherscan.io',
      },
    ],
    goldrushName: 'optimism-mainnet',
  },
  {
    id: 324,
    name: 'zkSync Era',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.era.zksync.io'],
    blockExplorers: [
      {
        name: 'zkSync Explorer',
        url: 'https://explorer.zksync.io',
      },
    ],
    goldrushName: 'zksync-mainnet',
  },
  {
    id: 137,
    name: 'Polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorers: [
      {
        name: 'Polygonscan',
        url: 'https://polygonscan.com',
      },
    ],
    goldrushName: 'matic-mainnet',
  },
];

export const CHAIN_ID_TO_NAME: Record<number, string> = SUPPORTED_CHAINS.reduce(
  (acc, chain) => {
    acc[chain.id] = chain.name;
    return acc;
  },
  {} as Record<number, string>
);

export const CHAIN_NAME_TO_ID: Record<string, number> = SUPPORTED_CHAINS.reduce(
  (acc, chain) => {
    acc[chain.name.toLowerCase()] = chain.id;
    return acc;
  },
  {} as Record<string, number>
);

export const GOLDRUSH_CHAIN_NAMES = SUPPORTED_CHAINS.map((chain) => chain.goldrushName);

/**
 * Get chain by ID
 */
export function getChainById(chainId: number): Chain | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId);
}

/**
 * Get chain by name
 */
export function getChainByName(name: string): Chain | undefined {
  return SUPPORTED_CHAINS.find(
    (chain) => chain.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get chain by GoldRush name
 */
export function getChainByGoldrushName(goldrushName: string): Chain | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.goldrushName === goldrushName);
}

/**
 * Check if chain ID is supported
 */
export function isChainSupported(chainId: number): boolean {
  return SUPPORTED_CHAINS.some((chain) => chain.id === chainId);
}

/**
 * Get supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return SUPPORTED_CHAINS.map((chain) => chain.id);
}

/**
 * Get chain name by ID
 */
export function getChainName(chainId: number): string {
  return CHAIN_ID_TO_NAME[chainId] || `Unknown Chain (${chainId})`;
}

/**
 * Get chain explorer URL for address
 */
export function getExplorerAddressUrl(chainId: number, address: string): string | undefined {
  const chain = getChainById(chainId);
  if (!chain?.blockExplorers?.[0]) return undefined;
  return `${chain.blockExplorers[0].url}/address/${address}`;
}

/**
 * Get chain explorer URL for transaction
 */
export function getExplorerTxUrl(chainId: number, txHash: string): string | undefined {
  const chain = getChainById(chainId);
  if (!chain?.blockExplorers?.[0]) return undefined;
  return `${chain.blockExplorers[0].url}/tx/${txHash}`;
}

/**
 * Get chain native currency symbol
 */
export function getNativeCurrencySymbol(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.nativeCurrency.symbol || 'ETH';
}

/**
 * Map of chain IDs to their colors (for UI)
 */
export const CHAIN_COLORS: Record<number, string> = {
  1: '#627EEA', // Ethereum
  8453: '#0052FF', // Base
  42161: '#28A0F0', // Arbitrum
  10: '#FF0420', // Optimism
  324: '#8C8DFC', // zkSync
  137: '#8247E5', // Polygon
};

/**
 * Get chain color
 */
export function getChainColor(chainId: number): string {
  return CHAIN_COLORS[chainId] || '#666666';
}

/**
 * Chain categories for grouping
 */
export const CHAIN_CATEGORIES = {
  LAYER_1: [1],
  LAYER_2: [8453, 42161, 10, 324, 137],
} as const;

/**
 * Get chain category
 */
export function getChainCategory(chainId: number): 'LAYER_1' | 'LAYER_2' | 'UNKNOWN' {
  if (CHAIN_CATEGORIES.LAYER_1.includes(chainId)) return 'LAYER_1';
  if (CHAIN_CATEGORIES.LAYER_2.includes(chainId)) return 'LAYER_2';
  return 'UNKNOWN';
}

