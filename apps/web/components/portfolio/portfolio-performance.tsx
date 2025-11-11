'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { TrendingUp, TrendingDown, Minus, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PortfolioPerformanceProps {
  address: string;
  className?: string;
}

interface PerformanceDataPoint {
  date: string;
  totalValue: number;
  airdropScore: number;
  transactionCount: number;
  gasSpent: number;
}

interface PortfolioPerformanceData {
  address: string;
  currentValue: number;
  performance: {
    day1: number;
    day7: number;
    day30: number;
    allTime: number;
  };
  dataPoints: PerformanceDataPoint[];
  trends: {
    valueTrend: 'up' | 'down' | 'stable';
    scoreTrend: 'up' | 'down' | 'stable';
    activityTrend: 'up' | 'down' | 'stable';
  };
  timestamp: number;
}

export function PortfolioPerformance({ address, className = '' }: PortfolioPerformanceProps) {
  const [data, setData] = useState<PortfolioPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    async function fetchPerformance() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/portfolio-performance/${address}`);
        if (!response.ok) {
          throw new Error('Failed to fetch performance data');
        }
        
        const performanceData = await response.json();
        setData(performanceData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchPerformance();
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
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Error loading performance data</CardDescription>
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

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Portfolio Performance
        </CardTitle>
        <CardDescription>Track your portfolio value and performance over time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Value */}
        <div className="bg-muted/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Portfolio Value</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(data.currentValue)}</p>
            </div>
            {getTrendIcon(data.trends.valueTrend)}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">24h</p>
            <p className={cn("text-xl font-bold mt-1", getTrendColor(data.performance.day1))}>
              {formatPercent(data.performance.day1)}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">7d</p>
            <p className={cn("text-xl font-bold mt-1", getTrendColor(data.performance.day7))}>
              {formatPercent(data.performance.day7)}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">30d</p>
            <p className={cn("text-xl font-bold mt-1", getTrendColor(data.performance.day30))}>
              {formatPercent(data.performance.day30)}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">All Time</p>
            <p className={cn("text-xl font-bold mt-1", getTrendColor(data.performance.allTime))}>
              {formatPercent(data.performance.allTime)}
            </p>
          </div>
        </div>

        {/* Performance Chart */}
        {data.dataPoints.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Value Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsLineChart data={data.dataPoints}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalValue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Trends */}
        <div>
          <h3 className="font-semibold mb-3">Trends</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getTrendIcon(data.trends.valueTrend)}
                <span className="font-medium">Portfolio Value</span>
              </div>
              <Badge variant={data.trends.valueTrend === 'up' ? 'default' : 'secondary'}>
                {data.trends.valueTrend}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getTrendIcon(data.trends.scoreTrend)}
                <span className="font-medium">Airdrop Score</span>
              </div>
              <Badge variant={data.trends.scoreTrend === 'up' ? 'default' : 'secondary'}>
                {data.trends.scoreTrend}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getTrendIcon(data.trends.activityTrend)}
                <span className="font-medium">Activity Level</span>
              </div>
              <Badge variant={data.trends.activityTrend === 'up' ? 'default' : 'secondary'}>
                {data.trends.activityTrend}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



