/**
 * useAirdrop Hook
 */

import { useState, useEffect } from 'react';
import { AirdropService, Airdrop } from '../services/airdrop.service';

export function useAirdrop(address: string | null) {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    const fetchAirdrops = async () => {
      setLoading(true);
      setError(null);

      try {
        const service = new AirdropService();
        const data = await service.checkEligibility(address);
        setAirdrops(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAirdrops();
  }, [address]);

  return { airdrops, loading, error };
}

