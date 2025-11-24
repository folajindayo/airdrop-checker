import { useState, useCallback } from "react";

export interface FilterOptions {
  status?: string[];
  chain?: string[];
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
}

interface UseFiltersResult {
  filters: FilterOptions;
  setFilter: <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => void;
  removeFilter: (key: keyof FilterOptions) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export function useFilters(initialFilters: FilterOptions = {}): UseFiltersResult {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const setFilter = useCallback(
    <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const removeFilter = useCallback((key: keyof FilterOptions) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const activeFilterCount = Object.keys(filters).length;
  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}

