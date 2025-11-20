/**
 * useAirdropEligibility Hook
 * Presentation layer hook for checking airdrop eligibility
 */

import { useState, useCallback } from 'react';
import { CheckAirdropEligibilityUseCase } from '../../domain/use-cases';
import { EligibilityResult } from '../../domain/repositories';

export interface UseAirdropEligibilityReturn {
  checkEligibility: (airdropId: string, walletAddress: string) => Promise<void>;
  eligibilityResult: EligibilityResult | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useAirdropEligibility(
  useCase: CheckAirdropEligibilityUseCase
): UseAirdropEligibilityReturn {
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = useCallback(
    async (airdropId: string, walletAddress: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await useCase.execute({ airdropId, walletAddress });

        if (result.success && result.eligibilityResult) {
          setEligibilityResult(result.eligibilityResult);
        } else {
          setError(result.error || 'Failed to check eligibility');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    },
    [useCase]
  );

  const reset = useCallback(() => {
    setEligibilityResult(null);
    setError(null);
  }, []);

  return {
    checkEligibility,
    eligibilityResult,
    isLoading,
    error,
    reset,
  };
}

