/**
 * Wallet Context
 */

'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const value = {
    address,
    isConnected,
    connect: () => open(),
    disconnect: () => open(),
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within WalletProvider');
  }
  return context;
}

