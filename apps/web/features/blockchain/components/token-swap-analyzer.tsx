'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Target,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TokenSwap {
  hash: string;
  timestamp: string;
  dex: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  valueUSD: number;
  priceImpact: number;
  gasUsed: number;
  gasCost: number;
  chain: string;
  profit?: number;
}

interface SwapStats {
  totalSwaps: number;
  totalVolume: number;
  totalGasSpent: number;
  averageSwapSize: number;
  profitableSwaps: number;
  totalProfit: number;
  mostUsedDex: string;
  favoriteToken: string;
}

interface SwapAnalyzerData {
  stats: SwapStats;
  swaps: TokenSwap[];
  dexDistribution: { dex: string; count: number; volume: number }[];
  tokenPairs: { pair: string; count: number; volume: number }[];
  dailyVolume: { date: string; volume: number; swaps: number }[];
  chainDistribution: { chain: string; count: number; volume: number }[];
  profitLoss: { date: string; profit: number }[];
}

interface TokenSwapAnalyzerProps {
  address: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export function TokenSwapAnalyzer({ address }: TokenSwapAnalyzerProps) {
  const [data, setData] = useState<SwapAnalyzerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [filterDex, setFilterDex] = useState<string>('all');

  useEffect(() => {
    if (address) {
      fetchSwapData();
    }
  }, [address, timeRange]);

  async function fetchSwapData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/swap-analyzer/${address}?timeRange=${timeRange}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching swap data:', error);
      toast.error('Failed to load swap data');
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
        <ArrowRightLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No swap data available</p>
      </Card>
    );
  }

  const filteredSwaps = filterDex === 'all' 
    ? data.swaps 
    : data.swaps.filter(swap => swap.dex === filterDex);

  const profitPercentage = (data.stats.profitableSwaps / data.stats.totalSwaps) * 100;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d', 'all'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === 'all' ? 'All Time' : range.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Swaps</p>
            <ArrowRightLeft className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{data.stats.totalSwaps}</p>
          <p className="text-xs text-muted-foreground mt-1">
            ${data.stats.totalVolume.toLocaleString()} volume
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Avg Swap Size</p>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">
            ${data.stats.averageSwapSize.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Profitable Swaps</p>
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{profitPercentage.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.stats.profitableSwaps} of {data.stats.totalSwaps}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total P&L</p>
            {data.stats.totalProfit >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </div>
          <p className={`text-3xl font-bold ${data.stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(data.stats.totalProfit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </Card>
      </div>

      {/* Daily Volume Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Swap Volume</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.dailyVolume}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis yAxisId="left" className="text-xs" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" className="text-xs" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number, name: string) => [
                name === 'volume' ? `$${value.toLocaleString()}` : value,
                name === 'volume' ? 'Volume' : 'Swaps',
              ]}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="volume" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Volume" />
            <Line yAxisId="right" type="monotone" dataKey="swaps" stroke="#10b981" strokeWidth={2} name="Swaps" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DEX Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">DEX Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.dexDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ dex, count }) => `${dex}: ${count}`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="count"
              >
                {data.dexDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {data.dexDistribution.map((item, index) => (
              <div key={item.dex} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{item.dex}</span>
                </div>
                <span className="font-medium">{item.count} swaps · ${(item.volume / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Chain Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Chain Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.chainDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="chain" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Token Pairs */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Token Pairs</h3>
        <div className="space-y-3">
          {data.tokenPairs.slice(0, 10).map((pair, index) => (
            <div key={pair.pair} className="flex items-center gap-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{pair.pair}</span>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{pair.count} swaps</span>
                    <span className="mx-2">•</span>
                    <span>${pair.volume.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${(pair.count / data.tokenPairs[0].count) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Profit/Loss Timeline */}
      {data.profitLoss.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Profit/Loss Timeline</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.profitLoss}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Recent Swaps */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Swaps</h3>
          <select
            value={filterDex}
            onChange={(e) => setFilterDex(e.target.value)}
            className="px-3 py-1 bg-background border rounded-md text-sm"
          >
            <option value="all">All DEXs</option>
            {data.dexDistribution.map((dex) => (
              <option key={dex.dex} value={dex.dex}>
                {dex.dex}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          {filteredSwaps.slice(0, 10).map((swap) => (
            <div
              key={swap.hash}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{swap.dex}</Badge>
                  <Badge variant="outline">{swap.chain}</Badge>
                  {swap.profit && swap.profit > 0 && (
                    <Badge variant="default" className="bg-green-600">
                      +${swap.profit.toFixed(2)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{swap.amountIn.toFixed(4)} {swap.tokenIn}</span>
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{swap.amountOut.toFixed(4)} {swap.tokenOut}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(swap.timestamp).toLocaleString()} · Gas: ${swap.gasCost.toFixed(2)}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold">${swap.valueUSD.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  Impact: {swap.priceImpact.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <div className="flex items-start gap-4">
          <ArrowRightLeft className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Swap Insights</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  Your most used DEX is {data.stats.mostUsedDex} with {data.dexDistribution.find(d => d.dex === data.stats.mostUsedDex)?.count} swaps
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Percent className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  {profitPercentage.toFixed(1)}% of your swaps were profitable
                </span>
              </li>
              <li className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>
                  Average swap size: ${data.stats.averageSwapSize.toLocaleString()} · Total gas spent: ${data.stats.totalGasSpent.toFixed(2)}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

