'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/common/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, TrendingDown, Activity, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface GasTrackerProps {
  address: string;
  className?: string;
}

interface GasTrackerData {
  address: string;
  totalGasSpent: number;
  totalGasSpentUSD: number;
  chainBreakdown: Array<{
    chainId: number;
    chainName: string;
    gasSpent: number;
    gasSpentUSD: number;
    transactionCount: number;
    avgGasPrice: number;
  }>;
  recentTransactions: Array<{
    tx_hash: string;
    block_signed_at: string;
    gas_spent: number;
    gas_quote: number;
    chain_name: string;
  }>;
  monthlyBreakdown: Array<{
    month: string;
    gasSpentUSD: number;
    transactionCount: number;
  }>;
  timestamp: number;
}

export function GasTracker({ address, className = '' }: GasTrackerProps) {
  const [data, setData] = useState<GasTrackerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    async function fetchGasData() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/gas-tracker/${address}`);
        if (!response.ok) {
          throw new Error('Failed to fetch gas tracker data');
        }
        
        const gasData = await response.json();
        setData(gasData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchGasData();
  }, [address]);

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
          <CardTitle>Gas Tracker</CardTitle>
          <CardDescription>Error loading gas data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5" />
          Gas Tracker
        </CardTitle>
        <CardDescription>Track your gas spending across all chains</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chains">By Chain</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Gas Spent</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(data.totalGasSpentUSD)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatNumber(data.totalGasSpent)} gas units
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            {data.monthlyBreakdown.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Monthly Breakdown
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={formatMonth}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => formatMonth(label)}
                    />
                    <Bar dataKey="gasSpentUSD" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chains" className="space-y-4 mt-4">
            <div className="space-y-2">
              {data.chainBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No gas data available
                </p>
              ) : (
                data.chainBreakdown.map((chain) => {
                  const percentage = (chain.gasSpentUSD / data.totalGasSpentUSD) * 100;
                  
                  return (
                    <div key={chain.chainId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{chain.chainName}</span>
                          <Badge variant="secondary">
                            <Activity className="h-3 w-3 mr-1" />
                            {chain.transactionCount} txs
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{formatCurrency(chain.gasSpentUSD)}</span>
                          <p className="text-xs text-muted-foreground">
                            Avg: {formatNumber(chain.avgGasPrice)} gwei
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No transaction history
                </p>
              ) : (
                data.recentTransactions.map((tx) => (
                  <div
                    key={tx.tx_hash}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono truncate">{tx.tx_hash}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(tx.block_signed_at).toLocaleDateString()} • {tx.chain_name}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-sm">{formatCurrency(tx.gas_quote)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(tx.gas_spent)} gas
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

