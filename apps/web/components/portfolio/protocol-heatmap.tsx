'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/common/skeleton';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProtocolHeatmapProps {
  address: string;
  className?: string;
}

interface ProtocolInteraction {
  protocol: string;
  chainId: number;
  chainName: string;
  date: string;
  transactionCount: number;
  totalValue: number;
}

interface HeatmapData {
  address: string;
  interactions: ProtocolInteraction[];
  protocolList: string[];
  dateRange: {
    start: string;
    end: string;
  };
  totalInteractions: number;
  topProtocols: Array<{
    protocol: string;
    interactionCount: number;
    totalValue: number;
  }>;
  timestamp: number;
}

export function ProtocolHeatmap({ address, className = '' }: ProtocolHeatmapProps) {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    async function fetchHeatmap() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/protocol-heatmap/${address}`);
        if (!response.ok) {
          throw new Error('Failed to fetch protocol heatmap');
        }
        
        const heatmapData = await response.json();
        setData(heatmapData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchHeatmap();
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
          <CardTitle>Protocol Interaction Heatmap</CardTitle>
          <CardDescription>Error loading heatmap data</CardDescription>
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Group interactions by protocol and date
  const heatmapMap = new Map<string, { count: number; value: number }>();
  
  data.interactions.forEach((interaction) => {
    const key = `${interaction.protocol}-${interaction.date}`;
    if (!heatmapMap.has(key)) {
      heatmapMap.set(key, { count: 0, value: 0 });
    }
    const entry = heatmapMap.get(key)!;
    entry.count += interaction.transactionCount;
    entry.value += interaction.totalValue;
  });

  // Get max values for normalization
  const maxCount = Math.max(...Array.from(heatmapMap.values()).map((v) => v.count), 1);
  const maxValue = Math.max(...Array.from(heatmapMap.values()).map((v) => v.value), 1);

  const getIntensity = (count: number, max: number) => {
    if (max === 0) return 0;
    const ratio = count / max;
    if (ratio >= 0.8) return 5;
    if (ratio >= 0.6) return 4;
    if (ratio >= 0.4) return 3;
    if (ratio >= 0.2) return 2;
    return 1;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Protocol Interaction Heatmap
        </CardTitle>
        <CardDescription>
          Visualize your protocol interactions over time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Interactions</p>
            <p className="text-2xl font-bold mt-1">{data.totalInteractions}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Protocols</p>
            <p className="text-2xl font-bold mt-1">{data.protocolList.length}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Date Range</p>
            <p className="text-sm font-semibold mt-1">
              {new Date(data.dateRange.start).toLocaleDateString()} - {new Date(data.dateRange.end).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Top Protocols */}
        {data.topProtocols.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Protocols
            </h3>
            <div className="space-y-2">
              {data.topProtocols.map((protocol) => (
                <div
                  key={protocol.protocol}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{protocol.protocol}</span>
                    <Badge variant="secondary">
                      {protocol.interactionCount} interaction{protocol.interactionCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(protocol.totalValue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Heatmap Grid */}
        <div>
          <h3 className="font-semibold mb-3">Interaction Intensity</h3>
          <div className="space-y-2">
            {data.protocolList.slice(0, 10).map((protocol) => {
              const protocolInteractions = data.interactions.filter(
                (i) => i.protocol === protocol
              );
              const dates = [...new Set(protocolInteractions.map((i) => i.date))].sort();
              
              return (
                <div key={protocol} className="space-y-1">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium capitalize">{protocol}</span>
                    <span className="text-muted-foreground">
                      {protocolInteractions.reduce((sum, i) => sum + i.transactionCount, 0)} txs
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {dates.slice(-30).map((date) => {
                      const interaction = protocolInteractions.find((i) => i.date === date);
                      const count = interaction?.transactionCount || 0;
                      const intensity = getIntensity(count, maxCount);
                      
                      return (
                        <div
                          key={`${protocol}-${date}`}
                          className={cn(
                            "h-6 w-6 rounded border",
                            intensity === 5 && "bg-green-600",
                            intensity === 4 && "bg-green-500",
                            intensity === 3 && "bg-yellow-500",
                            intensity === 2 && "bg-yellow-400",
                            intensity === 1 && "bg-gray-200 dark:bg-gray-700",
                            intensity === 0 && "bg-gray-100 dark:bg-gray-800"
                          )}
                          title={`${protocol} - ${date}: ${count} transactions`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded border" />
              <span>Less</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-yellow-400 rounded border" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-green-600 rounded border" />
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



