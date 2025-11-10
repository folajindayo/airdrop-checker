'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { TrendingUp, TrendingDown, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortfolioRebalancerProps {
  address: string;
  className?: string;
}

interface RebalancingRecommendation {
  action: 'buy' | 'sell' | 'hold' | 'move';
  tokenSymbol: string;
  currentAllocation: number;
  recommendedAllocation: number;
  currentValue: number;
  recommendedValue: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface RebalancingData {
  address: string;
  currentTotalValue: number;
  currentAllocation: Record<string, number>;
  recommendations: RebalancingRecommendation[];
  targetAllocation: Record<string, number>;
  estimatedGasCost: number;
  timestamp: number;
}

export function PortfolioRebalancer({ address, className = '' }: PortfolioRebalancerProps) {
  const [data, setData] = useState<RebalancingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    generateRecommendations();
  }, [address]);

  async function generateRecommendations() {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/portfolio-rebalancer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate rebalancing recommendations');
      }

      const rebalancingData = await response.json();
      setData(rebalancingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

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
          <CardTitle>Portfolio Rebalancer</CardTitle>
          <CardDescription>Error loading recommendations</CardDescription>
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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'buy':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'sell':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Portfolio Rebalancer
        </CardTitle>
        <CardDescription>Optimize your portfolio allocation for better airdrop eligibility</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(data.currentTotalValue)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Est. Gas Cost</p>
              <p className="text-lg font-semibold mt-1">{formatCurrency(data.estimatedGasCost)}</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {data.recommendations.length > 0 ? (
          <div>
            <h3 className="font-semibold mb-3">Rebalancing Recommendations</h3>
            <div className="space-y-3">
              {data.recommendations.map((rec, index) => {
                const diff = rec.recommendedAllocation - rec.currentAllocation;
                const diffValue = rec.recommendedValue - rec.currentValue;

                return (
                  <div
                    key={index}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getActionIcon(rec.action)}
                        <span className="font-semibold">{rec.tokenSymbol}</span>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Action</p>
                        <p className="font-semibold uppercase">{rec.action}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Current Allocation</span>
                        <span className="font-medium">{rec.currentAllocation.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Recommended</span>
                        <span className="font-semibold">{rec.recommendedAllocation.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{formatCurrency(rec.currentValue)}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className={cn(
                            "text-sm font-semibold",
                            diffValue > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {formatCurrency(rec.recommendedValue)}
                          </span>
                        </div>
                        <Badge variant={diff > 0 ? 'default' : 'secondary'}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div className="flex h-2">
                          <div
                            className="bg-primary rounded-l-full"
                            style={{ width: `${rec.currentAllocation}%` }}
                          />
                          <div
                            className={cn(
                              "rounded-r-full",
                              diff > 0 ? "bg-green-500" : "bg-red-500"
                            )}
                            style={{ width: `${Math.abs(diff)}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{rec.reason}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No rebalancing needed</p>
            <p className="text-sm mt-1">Your portfolio allocation is optimal</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

