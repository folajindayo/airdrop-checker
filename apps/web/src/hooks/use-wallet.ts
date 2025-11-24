'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

/**
 * Custom hook for wallet connection
 */
export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    chain,
    connect: () => open(),
    disconnect,
  };
}

