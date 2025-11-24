/**
 * useEligibilityCheck Hook
 */

import { useState, useCallback } from 'react';

export function useEligibilityCheck() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkEligibility = useCallback(async (walletAddress: string, chainId: number, airdropId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/eligibility/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, chainId, airdropId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, checkEligibility };
}


