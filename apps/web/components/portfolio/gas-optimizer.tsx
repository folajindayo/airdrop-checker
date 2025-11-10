'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Zap, TrendingDown, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GasOptimizerProps {
  className?: string;
}

interface GasPriceData {
  chainId: number;
  chainName: string;
  currentGasPrice: number;
  recommendedTime: string;
  estimatedSavings: number;
  historicalAverage: number;
}

interface GasOptimizerData {
  recommendations: GasPriceData[];
  bestChain: {
    chainId: number;
    chainName: string;
    gasPrice: number;
    savings: number;
  };
  bestTime: {
    time: string;
    savings: number;
  };
  timestamp: number;
}

export function GasOptimizer({ className = '' }: GasOptimizerProps) {
  const [data, setData] = useState<GasOptimizerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOptimizer() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/gas-optimizer');
        if (!response.ok) {
          throw new Error('Failed to fetch gas optimizer data');
        }
        
        const optimizerData = await response.json();
        setData(optimizerData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchOptimizer();
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Gas Optimizer</CardTitle>
          <CardDescription>Error loading gas data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const formatGasPrice = (price: number) => {
    if (price < 1) {
      return `${price.toFixed(3)} gwei`;
    }
    return `${price.toFixed(1)} gwei`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Gas Optimizer
        </CardTitle>
        <CardDescription>Find the best chains and times for lowest gas fees</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Best Chain */}
        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                Best Chain (Lowest Gas)
              </p>
              <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                {data.bestChain.chainName}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {formatGasPrice(data.bestChain.gasPrice)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Best Time */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Best Time to Transact
              </p>
              <p className="text-xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                {data.bestTime.time}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Save up to {data.bestTime.savings}% on gas fees
              </p>
            </div>
          </div>
        </div>

        {/* Chain Recommendations */}
        <div>
          <h3 className="font-semibold mb-3">Gas Prices by Chain</h3>
          <div className="space-y-2">
            {data.recommendations.map((chain) => {
              const isBest = chain.chainId === data.bestChain.chainId;
              return (
                <div
                  key={chain.chainId}
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-lg",
                    isBest && "bg-green-50 dark:bg-green-950/10 border-green-200 dark:border-green-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{chain.chainName}</span>
                    {isBest && (
                      <Badge className="bg-green-600">Best</Badge>
                    )}
                    {chain.estimatedSavings > 0 && (
                      <Badge variant="secondary">
                        Save {chain.estimatedSavings.toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatGasPrice(chain.currentGasPrice)}</p>
                    <p className="text-xs text-muted-foreground">
                      Avg: {formatGasPrice(chain.historicalAverage)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Recommendations</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Use {data.bestChain.chainName} for the lowest gas fees</li>
            <li>• Schedule transactions during {data.bestTime.time} for best rates</li>
            <li>• Consider Layer 2 chains (Base, Arbitrum, Optimism) for significant savings</li>
            <li>• Monitor gas prices before executing high-value transactions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

