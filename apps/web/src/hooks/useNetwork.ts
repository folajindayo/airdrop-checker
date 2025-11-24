/**
 * useNetwork Hook
 */

'use client';

import { useState, useEffect } from 'react';

export function useNetwork() {
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum
        .request({ method: 'eth_chainId' })
        .then((id: string) => {
          setChainId(parseInt(id, 16));
          setIsConnected(true);
        })
        .catch(console.error);

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
      };

      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const switchNetwork = async (targetChainId: number) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  return { chainId, isConnected, switchNetwork };
}

