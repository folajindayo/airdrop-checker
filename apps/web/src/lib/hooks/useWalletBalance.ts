/**
 * useWalletBalance Hook
 */

'use client';

import { useState, useEffect } from 'react';

interface Balance {
  native: string;
  tokens: Array<{ symbol: string; balance: string; value: number }>;
  totalValue: number;
}

export function useWalletBalance(address: string | undefined, chainId: number) {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    fetch(`/api/balance?address=${address}&chainId=${chainId}`)
      .then((res) => res.json())
      .then((data) => {
        setBalance(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setBalance(null);
      })
      .finally(() => setIsLoading(false));
  }, [address, chainId]);

  return { balance, isLoading, error };
}

