'use client';

import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, base, arbitrum, optimism, polygon } from '@reown/appkit/networks';
import { projectId, metadata } from '@/lib/wallet/config';

// Set up QueryClient for React Query
const queryClient = new QueryClient();

// Custom zkSync network for AppKit
const zkSyncNetwork = {
  id: 324,
  name: 'zkSync Era',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.era.zksync.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'zkSync Explorer',
      url: 'https://explorer.zksync.io',
    },
  },
};

// Create wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, base, arbitrum, optimism, zkSyncNetwork as any, polygon],
  projectId,
});

// Create the modal (AppKit)
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, base, arbitrum, optimism, zkSyncNetwork as any, polygon],
  metadata,
  features: {
    analytics: true,
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#4F46E5',
    '--w3m-border-radius-master': '8px',
  },
});

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

