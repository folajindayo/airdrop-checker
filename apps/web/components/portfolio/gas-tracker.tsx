'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/common/skeleton';
import { Zap, TrendingDown, Activity } from 'lucide-react';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';

interface GasTrackerProps {
  address: string;
}

interface GasData {
  totalGasSpentUSD: number;
  gasByChain: Record<number, {
    gasUsed: number;
    costUSD: number;
    txCount: number;
  }>;
  totalTransactions: number;
}

export function GasTracker({ address }: GasTrackerProps) {
  const [gasData, setGasData] = useState<GasData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGasData();
  }, [address]);

  async function fetchGasData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/gas-tracker/${address}`);
      if (!response.ok) throw new Error('Failed to fetch gas data');

      const data = await response.json();
      setGasData(data);
    } catch (error) {
      console.error('Error fetching gas data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!gasData) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No gas data available</p>
      </div>
    );
  }

  const chainEntries = Object.entries(gasData.gasByChain)
    .map(([chainId, data]) => ({
      chainId: parseInt(chainId, 10),
      chainName: SUPPORTED_CHAINS.find((c) => c.id === parseInt(chainId, 10))?.name || 'Unknown',
      ...data,
    }))
    .sort((a, b) => b.costUSD - a.costUSD);

  return (
    <div className="space-y-6">
      {/* Total Gas Spent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Total Gas Spent
          </CardTitle>
          <CardDescription>Estimated gas costs across all chains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            ${gasData.totalGasSpentUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>{gasData.totalTransactions} total transactions</span>
          </div>
        </CardContent>
      </Card>

      {/* Gas by Chain */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Gas Spending by Chain</h2>
        <div className="space-y-4">
          {chainEntries.map((chain) => (
            <Card key={chain.chainId}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{chain.chainName}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {chain.txCount} transactions
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${chain.costUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {((chain.costUSD / gasData.totalGasSpentUSD) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(chain.costUSD / gasData.totalGasSpentUSD) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
