import { cookieStorage, createStorage, http } from 'wagmi';
import { mainnet, base, arbitrum, optimism, polygon } from 'wagmi/chains';
import { createConfig } from 'wagmi';

// Custom chain for zkSync Era
export const zkSync = {
  id: 324,
  name: 'zkSync Era',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.era.zksync.io'] },
    public: { http: ['https://mainnet.era.zksync.io'] },
  },
  blockExplorers: {
    default: {
      name: 'zkSync Explorer',
      url: 'https://explorer.zksync.io',
    },
  },
} as const;

if (!process.env.NEXT_PUBLIC_REOWN_PROJECT_ID) {
  throw new Error('Please define the NEXT_PUBLIC_REOWN_PROJECT_ID environment variable');
}

export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

/**
 * Wagmi configuration with all supported chains
 */
export const wagmiConfig = createConfig({
  chains: [mainnet, base, arbitrum, optimism, zkSync, polygon],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [zkSync.id]: http(),
    [polygon.id]: http(),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

/**
 * Metadata for WalletConnect
 */
export const metadata = {
  name: 'Airdrop Finder',
  description: 'Check if you\'re eligible for the next big airdrop',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: ['/icon.svg'],
};

