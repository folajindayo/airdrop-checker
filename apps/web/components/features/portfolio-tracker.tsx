'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/common/skeleton';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TokenBalance {
  symbol: string;
  balance: number;
  value: number;
  change24h: number;
  chainId: number;
  logo?: string;
}

interface PortfolioData {
  totalValue: number;
  change24h: number;
  change7d: number;
  change30d: number;
  tokens: TokenBalance[];
  history: { date: string; value: number }[];
  chainDistribution: { chain: string; value: number; percentage: number }[];
}

interface PortfolioTrackerProps {
  address: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export function PortfolioTracker({ address }: PortfolioTrackerProps) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '1y'>('7d');
  const [viewMode, setViewMode] = useState<'chart' | 'tokens' | 'chains'>('chart');

  useEffect(() => {
    if (address) {
      fetchPortfolioData();
    }
  }, [address, timeframe]);

  async function fetchPortfolioData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/portfolio/${address}?timeframe=${timeframe}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No portfolio data available</p>
      </Card>
    );
  }

  const changePercent = timeframe === '24h' ? data.change24h : timeframe === '7d' ? data.change7d : data.change30d;
  const isPositive = changePercent >= 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 col-span-1 md:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
              <h2 className="text-4xl font-bold">${data.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <div className={`flex items-center gap-2 mt-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            <span className="text-lg font-semibold">{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</span>
            <span className="text-sm text-muted-foreground">({timeframe})</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">24h Change</p>
            <TrendingUp className={`h-5 w-5 ${data.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <p className={`text-2xl font-bold ${data.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.change24h >= 0 ? '+' : ''}{data.change24h.toFixed(2)}%
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">7d Change</p>
            <TrendingUp className={`h-5 w-5 ${data.change7d >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <p className={`text-2xl font-bold ${data.change7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.change7d >= 0 ? '+' : ''}{data.change7d.toFixed(2)}%
          </p>
        </Card>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['24h', '7d', '30d', '1y'] as const).map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'chart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('chart')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Chart
          </Button>
          <Button
            variant={viewMode === 'tokens' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('tokens')}
          >
            <Activity className="h-4 w-4 mr-2" />
            Tokens
          </Button>
          <Button
            variant={viewMode === 'chains' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('chains')}
          >
            <PieChart className="h-4 w-4 mr-2" />
            Chains
          </Button>
        </div>
      </div>

      {/* Chart View */}
      {viewMode === 'chart' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Portfolio Value Over Time</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data.history}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Tokens View */}
      {viewMode === 'tokens' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Token Holdings</h3>
          <div className="space-y-4">
            {data.tokens.map((token, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">{token.symbol.substring(0, 2)}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{token.symbol}</p>
                    <p className="text-sm text-muted-foreground">{token.balance.toFixed(4)} tokens</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${token.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <p className={`text-sm ${token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Chains View */}
      {viewMode === 'chains' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Chain Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={data.chainDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ chain, percentage }) => `${chain}: ${percentage.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.chainDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </RechartsPie>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Chain Breakdown</h3>
            <div className="space-y-4">
              {data.chainDistribution.map((chain, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{chain.chain}</span>
                    <span className="text-muted-foreground">${chain.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${chain.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{chain.percentage.toFixed(2)}% of portfolio</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

