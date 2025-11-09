'use client';

import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, base, arbitrum, optimism, polygon } from '@reown/appkit/networks';
import { wagmiConfig, projectId, metadata, zkSync } from '@/lib/wallet/config';

// Set up QueryClient for React Query
const queryClient = new QueryClient();

// Create the modal (AppKit)
const modal = createAppKit({
  adapters: [new WagmiAdapter({
    networks: [mainnet, base, arbitrum, optimism, zkSync, polygon],
    projectId,
  })],
  projectId,
  networks: [mainnet, base, arbitrum, optimism, zkSync as any, polygon],
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
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

