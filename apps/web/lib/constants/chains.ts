/**
 * Blockchain chain configurations
 * Centralized chain data for the application
 */

export interface ChainConfig {
  id: number;
  name: string;
  slug: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorers: {
    name: string;
    url: string;
  }[];
  testnet: boolean;
  icon?: string;
}

/**
 * Supported blockchain networks
 */
export const CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    slug: 'ethereum',
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
    testnet: false,
    icon: '/chains/ethereum.svg',
  },
  
  polygon: {
    id: 137,
    name: 'Polygon',
    slug: 'polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorers: [
      {
        name: 'PolygonScan',
        url: 'https://polygonscan.com',
      },
    ],
    testnet: false,
    icon: '/chains/polygon.svg',
  },

  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    slug: 'arbitrum',
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
    testnet: false,
    icon: '/chains/arbitrum.svg',
  },

  optimism: {
    id: 10,
    name: 'Optimism',
    slug: 'optimism',
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
    testnet: false,
    icon: '/chains/optimism.svg',
  },

  base: {
    id: 8453,
    name: 'Base',
    slug: 'base',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorers: [
      {
        name: 'BaseScan',
        url: 'https://basescan.org',
      },
    ],
    testnet: false,
    icon: '/chains/base.svg',
  },

  avalanche: {
    id: 43114,
    name: 'Avalanche C-Chain',
    slug: 'avalanche',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorers: [
      {
        name: 'SnowTrace',
        url: 'https://snowtrace.io',
      },
    ],
    testnet: false,
    icon: '/chains/avalanche.svg',
  },

  bsc: {
    id: 56,
    name: 'BNB Smart Chain',
    slug: 'bsc',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorers: [
      {
        name: 'BscScan',
        url: 'https://bscscan.com',
      },
    ],
    testnet: false,
    icon: '/chains/bsc.svg',
  },

  zksync: {
    id: 324,
    name: 'zkSync Era',
    slug: 'zksync',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.era.zksync.io'],
    blockExplorers: [
      {
        name: 'zkSync Era Block Explorer',
        url: 'https://explorer.zksync.io',
      },
    ],
    testnet: false,
    icon: '/chains/zksync.svg',
  },

  linea: {
    id: 59144,
    name: 'Linea',
    slug: 'linea',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.linea.build'],
    blockExplorers: [
      {
        name: 'LineaScan',
        url: 'https://lineascan.build',
      },
    ],
    testnet: false,
    icon: '/chains/linea.svg',
  },

  scroll: {
    id: 534352,
    name: 'Scroll',
    slug: 'scroll',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.scroll.io'],
    blockExplorers: [
      {
        name: 'Scrollscan',
        url: 'https://scrollscan.com',
      },
    ],
    testnet: false,
    icon: '/chains/scroll.svg',
  },
};

/**
 * Get chain configuration by ID
 */
export function getChainById(chainId: number): ChainConfig | undefined {
  return Object.values(CHAINS).find((chain) => chain.id === chainId);
}

/**
 * Get chain configuration by slug
 */
export function getChainBySlug(slug: string): ChainConfig | undefined {
  return CHAINS[slug];
}

/**
 * Get all mainnet chains
 */
export function getMainnetChains(): ChainConfig[] {
  return Object.values(CHAINS).filter((chain) => !chain.testnet);
}

/**
 * Get all testnet chains
 */
export function getTestnetChains(): ChainConfig[] {
  return Object.values(CHAINS).filter((chain) => chain.testnet);
}

/**
 * Get all chain IDs
 */
export function getAllChainIds(): number[] {
  return Object.values(CHAINS).map((chain) => chain.id);
}

/**
 * Check if chain ID is supported
 */
export function isSupportedChain(chainId: number): boolean {
  return getAllChainIds().includes(chainId);
}

/**
 * Get chain name by ID
 */
export function getChainName(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.name || `Unknown Chain (${chainId})`;
}

/**
 * Get block explorer URL for address
 */
export function getExplorerUrl(chainId: number, address: string): string | null {
  const chain = getChainById(chainId);
  if (!chain || chain.blockExplorers.length === 0) return null;
  
  return `${chain.blockExplorers[0]?.url}/address/${address}`;
}

/**
 * Get block explorer URL for transaction
 */
export function getTransactionUrl(chainId: number, txHash: string): string | null {
  const chain = getChainById(chainId);
  if (!chain || chain.blockExplorers.length === 0) return null;
  
  return `${chain.blockExplorers[0]?.url}/tx/${txHash}`;
}

/**
 * Default chain (Ethereum)
 */
export const DEFAULT_CHAIN = CHAINS.ethereum;

/**
 * Popular chains for quick access
 */
export const POPULAR_CHAINS = [
  CHAINS.ethereum,
  CHAINS.polygon,
  CHAINS.arbitrum,
  CHAINS.optimism,
  CHAINS.base,
];

