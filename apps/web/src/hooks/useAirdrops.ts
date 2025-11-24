/**
 * useAirdrops Hook
 */

import { useState, useEffect } from 'react';

export function useAirdrops(chainId?: number) {
  const [airdrops, setAirdrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAirdrops = async () => {
      try {
        setLoading(true);
        const query = chainId ? `?chainId=${chainId}` : '';
        const response = await fetch(`/api/airdrops${query}`);
        const data = await response.json();
        
        if (data.success) {
          setAirdrops(data.data.airdrops);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAirdrops();
  }, [chainId]);

  return { airdrops, loading, error };
}
