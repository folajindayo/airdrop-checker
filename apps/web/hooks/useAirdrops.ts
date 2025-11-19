import { useState, useEffect } from "react";
import { Airdrop, airdropService } from "@/lib/services/airdropService";

interface AirdropFilters {
  status?: string;
  chain?: string;
  page?: number;
  limit?: number;
}

interface UseAirdropsResult {
  airdrops: Airdrop[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  setFilters: (filters: AirdropFilters) => void;
  refetch: () => Promise<void>;
}

export function useAirdrops(initialFilters: AirdropFilters = {}): UseAirdropsResult {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AirdropFilters>(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchAirdrops = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await airdropService.getAirdrops(filters);

      setAirdrops(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load airdrops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAirdrops();
  }, [JSON.stringify(filters)]);

  return {
    airdrops,
    loading,
    error,
    pagination,
    setFilters,
    refetch: fetchAirdrops,
  };
}

