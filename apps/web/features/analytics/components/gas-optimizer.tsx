'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Zap, Clock, TrendingDown } from 'lucide-react';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';

interface GasPrice {
  chainId: number;
  chainName: string;
  slow: number;
  standard: number;
  fast: number;
  timestamp: number;
}

interface GasOptimizerData {
  gasPrices: GasPrice[];
  cheapestChain: {
    chainId: number;
    chainName: string;
    price: number;
  };
  recommendation: {
    bestTime: string;
    suggestedSpeed: string;
    reason: string;
  };
}

export function GasOptimizer() {
  const [data, setData] = useState<GasOptimizerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGasPrices();
  }, []);

  async function fetchGasPrices() {
    try {
      const response = await fetch('/api/gas-optimizer');
      if (!response.ok) throw new Error('Failed to fetch gas prices');

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching gas prices:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Gas Fee Optimizer
        </CardTitle>
        <CardDescription>
          Find the best time and chain to interact with protocols
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recommendation */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4" />
            <span className="font-semibold">Recommendation</span>
          </div>
          <p className="text-sm text-muted-foreground">{data.recommendation.reason}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={data.recommendation.bestTime === 'now' ? 'default' : 'secondary'}>
              {data.recommendation.bestTime === 'now' ? 'Good Time' : 'Wait'}
            </Badge>
            <Badge variant="outline">
              Suggested: {data.recommendation.suggestedSpeed}
            </Badge>
          </div>
        </div>

        {/* Cheapest Chain */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Cheapest Chain</div>
              <div className="text-xl font-bold">{data.cheapestChain.chainName}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Gas Price</div>
              <div className="text-xl font-bold">{data.cheapestChain.price} gwei</div>
            </div>
          </div>
        </div>

        {/* Chain Comparison */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Gas Prices by Chain</h4>
          <div className="space-y-2">
            {data.gasPrices
              .sort((a, b) => a.standard - b.standard)
              .map((gp) => (
                <div key={gp.chainId} className="flex items-center justify-between p-2 border rounded">
                  <div className="font-medium">{gp.chainName}</div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Slow: {gp.slow} gwei</span>
                    <span className="font-medium">Std: {gp.standard} gwei</span>
                    <span className="text-muted-foreground">Fast: {gp.fast} gwei</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



