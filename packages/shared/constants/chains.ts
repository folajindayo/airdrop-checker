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

