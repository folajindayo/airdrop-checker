import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "./useDebounce";

interface UseSearchOptions {
  debounceMs?: number;
  minLength?: number;
}

interface UseSearchResult<T> {
  query: string;
  debouncedQuery: string;
  results: T[];
  searching: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export function useSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  options: UseSearchOptions = {}
): UseSearchResult<T> {
  const { debounceMs = 300, minLength = 2 } = options;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, debounceMs);

  const search = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minLength) {
        setResults([]);
        setError(null);
        return;
      }

      setSearching(true);
      setError(null);

      try {
        const searchResults = await searchFn(searchQuery);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    [searchFn, minLength]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
  }, []);

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, search]);

  return {
    query,
    debouncedQuery,
    results,
    searching,
    error,
    setQuery,
    search,
    clearSearch,
  };
}

