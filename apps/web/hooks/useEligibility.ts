import { useState } from "react";
import { walletService } from "@/lib/services/walletService";

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  requirements: {
    name: string;
    met: boolean;
    details?: string;
  }[];
}

interface UseEligibilityResult {
  result: EligibilityResult | null;
  checking: boolean;
  error: string | null;
  checkEligibility: (address: string, airdropId: string) => Promise<void>;
  reset: () => void;
}

export function useEligibility(): UseEligibilityResult {
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = async (address: string, airdropId: string) => {
    if (!address || !airdropId) {
      setError("Address and airdrop ID are required");
      return;
    }

    setChecking(true);
    setError(null);
    setResult(null);

    try {
      const eligibilityData = await walletService.checkEligibility(address, airdropId);
      setResult(eligibilityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check eligibility");
    } finally {
      setChecking(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setChecking(false);
  };

  return {
    result,
    checking,
    error,
    checkEligibility,
    reset,
  };
}

