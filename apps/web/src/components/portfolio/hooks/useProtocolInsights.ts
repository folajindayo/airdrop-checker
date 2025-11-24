/**
 * Custom hook for protocol insights logic
 * Extracted from protocol-insights.tsx to reduce component size
 */

import { useState, useEffect } from 'react';
import type { ProtocolInsightsData } from '../protocol-insights.types';

export function useProtocolInsights(address: string) {
  const [data, setData] = useState<ProtocolInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Mock data - in production, fetch from API
        const mockData: ProtocolInsightsData = {
          focusAreas: [],
          categoryScores: [],
          timeline: [],
          protocolBreakdown: [],
          monthlyActivity: [],
          momentum: 'steady',
          velocity: {
            currentAvgDaily: 2.5,
            previousAvgDaily: 2.0,
            percentChange: 25,
            deltaInteractions: 0.5,
            trend: 'accelerating',
          },
          decay: {
            daysSinceInteraction: 2,
            status: 'fresh',
          },
          coverage: {
            score: 75,
            coveredCategories: ['defi', 'nft'],
            totalCategories: 5,
            missingCategories: ['dao', 'gaming', 'social'],
          },
          dormantProtocols: [],
          diversity: {
            score: 80,
            entropy: 0.85,
            categoryDistribution: [],
          },
        };

        setData(mockData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  return { data, loading, error };
}



