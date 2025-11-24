/**
 * useChainSwitch Hook
 */

import { useState, useCallback } from 'react';

export function useChainSwitch() {
  const [currentChain, setCurrentChain] = useState<number>(1);
  const [switching, setSwitching] = useState(false);

  const switchChain = useCallback(async (chainId: number) => {
    try {
      setSwitching(true);
      // Implementation would switch chain via wallet
      setCurrentChain(chainId);
    } catch (error) {
      console.error('Failed to switch chain:', error);
      throw error;
    } finally {
      setSwitching(false);
    }
  }, []);

  return { currentChain, switching, switchChain };
}


