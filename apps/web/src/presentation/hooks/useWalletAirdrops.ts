/**
 * useWalletAirdrops Hook
 * Presentation layer hook for fetching wallet airdrops
 */

import { useState, useEffect, useCallback } from 'react';
import { AirdropEntity } from '../../domain/entities';
import { GetWalletAirdropsUseCase } from '../../domain/use-cases';

export interface UseWalletAirdropsOptions {
  walletAddress?: string;
  chainIds?: number[];
  includeEnded?: boolean;
  limit?: number;
  autoFetch?: boolean;
}

export interface UseWalletAirdropsReturn {
  airdrops: AirdropEntity[];
  eligibilityScores: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWalletAirdrops(
  useCase: GetWalletAirdropsUseCase,
  options: UseWalletAirdropsOptions = {}
): UseWalletAirdropsReturn {
  const [airdrops, setAirdrops] = useState<AirdropEntity[]>([]);
  const [eligibilityScores, setEligibilityScores] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAirdrops = useCallback(async () => {
    if (!options.walletAddress) {
      setAirdrops([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await useCase.execute({
        walletAddress: options.walletAddress,
        chainIds: options.chainIds,
        includeEnded: options.includeEnded,
        limit: options.limit,
      });

      if (result.success && result.airdrops) {
        setAirdrops(result.airdrops);
        setEligibilityScores(result.eligibilityScores || {});
      } else {
        setError(result.error || 'Failed to fetch airdrops');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [useCase, options.walletAddress, options.chainIds, options.includeEnded, options.limit]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchAirdrops();
    }
  }, [fetchAirdrops, options.autoFetch]);

  return {
    airdrops,
    eligibilityScores,
    isLoading,
    error,
    refetch: fetchAirdrops,
  };
}

