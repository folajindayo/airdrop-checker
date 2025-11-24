"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Airdrop } from "@/lib/services/airdropService";

interface AirdropFilters {
  status?: "active" | "upcoming" | "ended";
  chain?: string;
  search?: string;
}

interface AirdropState {
  airdrops: Airdrop[];
  filters: AirdropFilters;
  loading: boolean;
  error: string | null;
}

interface AirdropContextType {
  state: AirdropState;
  setAirdrops: (airdrops: Airdrop[]) => void;
  setFilters: (filters: AirdropFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  filteredAirdrops: Airdrop[];
}

const AirdropContext = createContext<AirdropContextType | undefined>(undefined);

export function AirdropProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AirdropState>({
    airdrops: [],
    filters: {},
    loading: false,
    error: null,
  });

  const setAirdrops = (airdrops: Airdrop[]) => {
    setState((prev) => ({ ...prev, airdrops }));
  };

  const setFilters = (filters: AirdropFilters) => {
    setState((prev) => ({ ...prev, filters }));
  };

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  // Compute filtered airdrops
  const filteredAirdrops = state.airdrops.filter((airdrop) => {
    if (state.filters.status && airdrop.status !== state.filters.status) {
      return false;
    }

    if (state.filters.chain && airdrop.chain !== state.filters.chain) {
      return false;
    }

    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      return (
        airdrop.name.toLowerCase().includes(searchLower) ||
        airdrop.description.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  return (
    <AirdropContext.Provider
      value={{
        state,
        setAirdrops,
        setFilters,
        setLoading,
        setError,
        filteredAirdrops,
      }}
    >
      {children}
    </AirdropContext.Provider>
  );
}

export function useAirdrop() {
  const context = useContext(AirdropContext);

  if (context === undefined) {
    throw new Error("useAirdrop must be used within an AirdropProvider");
  }

  return context;
}

