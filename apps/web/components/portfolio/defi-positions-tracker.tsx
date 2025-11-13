'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/common/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, TrendingUp, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeFiPositionsTrackerProps {
  address: string;
  className?: string;
}

interface DeFiPosition {
  protocol: string;
  chainId: number;
  chainName: string;
  positionType: 'lp' | 'stake' | 'lend' | 'borrow' | 'farm';
  tokenSymbol: string;
  balance: string;
  valueUSD: number;
  lastUpdated: string;
}

interface DeFiPositionsData {
  address: string;
  totalValue: number;
  positions: DeFiPosition[];
  byProtocol: Record<string, {
    protocol: string;
    totalValue: number;
    positionCount: number;
    chains: number[];
  }>;
  byChain: Record<number, {
    chainId: number;
    chainName: string;
    totalValue: number;
    positionCount: number;
  }>;
  timestamp: number;
}

export function DeFiPositionsTracker({ address, className = '' }: DeFiPositionsTrackerProps) {
  const [data, setData] = useState<DeFiPositionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    async function fetchPositions() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/defi-positions/${address}`);
        if (!response.ok) {
          throw new Error('Failed to fetch DeFi positions');
        }
        
        const positionsData = await response.json();
        setData(positionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchPositions();
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
          <CardTitle>DeFi Positions Tracker</CardTitle>
          <CardDescription>Error loading DeFi positions</CardDescription>
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

  const getPositionTypeColor = (type: string) => {
    switch (type) {
      case 'lp':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'stake':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'farm':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'lend':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          DeFi Positions Tracker
        </CardTitle>
        <CardDescription>Track your DeFi positions across all protocols</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="protocols">By Protocol</TabsTrigger>
            <TabsTrigger value="positions">All Positions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total DeFi Value</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(data.totalValue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.positions.length} position{data.positions.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            {Object.keys(data.byChain).length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">By Chain</h3>
                <div className="space-y-2">
                  {Object.values(data.byChain).map((chain) => {
                    const percentage = (chain.totalValue / data.totalValue) * 100;
                    return (
                      <div key={chain.chainId} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{chain.chainName}</span>
                            <Badge variant="secondary">
                              {chain.positionCount} position{chain.positionCount !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <span className="font-semibold">{formatCurrency(chain.totalValue)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="protocols" className="space-y-4 mt-4">
            <div className="space-y-2">
              {Object.keys(data.byProtocol).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No protocol positions found
                </p>
              ) : (
                Object.values(data.byProtocol)
                  .sort((a, b) => b.totalValue - a.totalValue)
                  .map((protocol) => (
                    <div
                      key={protocol.protocol}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium capitalize">{protocol.protocol}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {protocol.positionCount} position{protocol.positionCount !== 1 ? 's' : ''}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {protocol.chains.length} chain{protocol.chains.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(protocol.totalValue)}</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="positions" className="space-y-4 mt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.positions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No positions found
                </p>
              ) : (
                data.positions
                  .sort((a, b) => b.valueUSD - a.valueUSD)
                  .map((position, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium capitalize">{position.protocol}</span>
                          <Badge className={getPositionTypeColor(position.positionType)}>
                            {position.positionType.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{position.chainName}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {position.tokenSymbol}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold">{formatCurrency(position.valueUSD)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(position.lastUpdated).toLocaleDateString()}
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



