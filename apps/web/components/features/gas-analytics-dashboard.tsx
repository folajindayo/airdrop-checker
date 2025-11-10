'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  Zap,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Flame,
  Clock,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface GasTransaction {
  hash: string;
  timestamp: string;
  gasUsed: number;
  gasPrice: number;
  gasCost: number;
  chain: string;
  type: string;
}

interface GasStats {
  totalGasSpent: number;
  totalTransactions: number;
  averageGasPrice: number;
  averageGasCost: number;
  highestGasCost: number;
  lowestGasCost: number;
  mostExpensiveChain: string;
  bestTimeToTransact: string;
}

interface GasAnalyticsData {
  stats: GasStats;
  transactions: GasTransaction[];
  dailyGas: { date: string; cost: number; transactions: number }[];
  hourlyPattern: { hour: number; avgGasPrice: number; txCount: number }[];
  chainDistribution: { chain: string; cost: number; percentage: number }[];
  typeDistribution: { type: string; cost: number; count: number }[];
  monthlyTrend: { month: string; cost: number }[];
}

interface GasAnalyticsDashboardProps {
  address: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export function GasAnalyticsDashboard({ address }: GasAnalyticsDashboardProps) {
  const [data, setData] = useState<GasAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    if (address) {
      fetchGasAnalytics();
    }
  }, [address, timeRange]);

  async function fetchGasAnalytics() {
    setLoading(true);
    try {
      const response = await fetch(`/api/gas-analytics/${address}?timeRange=${timeRange}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching gas analytics:', error);
      toast.error('Failed to load gas analytics');
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
        <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No gas analytics data available</p>
      </Card>
    );
  }

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
            <p className="text-sm text-muted-foreground">Total Gas Spent</p>
            <DollarSign className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">
            ${data.stats.totalGasSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.stats.totalTransactions} transactions
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Avg Gas Price</p>
            <Flame className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold">{data.stats.averageGasPrice.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Gwei</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Avg Cost/Tx</p>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">
            ${data.stats.averageGasCost.toFixed(2)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Best Time</p>
            <Clock className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold">{data.stats.bestTimeToTransact}</p>
          <p className="text-xs text-muted-foreground mt-1">Lowest avg gas</p>
        </Card>
      </div>

      {/* Daily Gas Spending */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Gas Spending</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.dailyGas}>
            <defs>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis yAxisId="left" className="text-xs" tickFormatter={(value) => `$${value}`} />
            <YAxis yAxisId="right" orientation="right" className="text-xs" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number, name: string) => [
                name === 'cost' ? `$${value.toFixed(2)}` : value,
                name === 'cost' ? 'Gas Cost' : 'Transactions',
              ]}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="cost"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorCost)"
              name="Gas Cost"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="transactions"
              stroke="#3b82f6"
              name="Transactions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Hourly Pattern */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Hourly Gas Price Pattern</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.hourlyPattern}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="hour"
              className="text-xs"
              tickFormatter={(hour) => `${hour}:00`}
            />
            <YAxis className="text-xs" tickFormatter={(value) => `${value} Gwei`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number, name: string) => [
                name === 'avgGasPrice' ? `${value.toFixed(2)} Gwei` : value,
                name === 'avgGasPrice' ? 'Avg Gas Price' : 'Transactions',
              ]}
            />
            <Bar dataKey="avgGasPrice" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Avg Gas Price" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-600" />
            <p className="text-sm">
              <strong>Tip:</strong> Best time to transact is around {data.stats.bestTimeToTransact} UTC when gas prices are typically lowest.
            </p>
          </div>
        </div>
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chain Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Gas by Chain</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.chainDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ chain, percentage }) => `${chain}: ${percentage.toFixed(1)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="cost"
              >
                {data.chainDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {data.chainDistribution.map((item, index) => (
              <div key={item.chain} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{item.chain}</span>
                </div>
                <span className="font-medium">${item.cost.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Type Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Gas by Transaction Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.typeDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="type" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Bar dataKey="cost" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Gas Spending Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Line
              type="monotone"
              dataKey="cost"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Expensive Transactions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Most Expensive Transactions</h3>
        <div className="space-y-3">
          {data.transactions
            .sort((a, b) => b.gasCost - a.gasCost)
            .slice(0, 10)
            .map((tx) => (
              <div
                key={tx.hash}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{tx.chain}</Badge>
                    <Badge variant="outline" className="capitalize">
                      {tx.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {tx.hash}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-red-600">${tx.gasCost.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.gasPrice.toFixed(2)} Gwei
                  </p>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex items-start gap-4">
          <Zap className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Gas Optimization Insights</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <TrendingDown className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  You could save ~${(data.stats.totalGasSpent * 0.15).toFixed(2)} by transacting during off-peak hours ({data.stats.bestTimeToTransact} UTC)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Flame className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span>
                  {data.stats.mostExpensiveChain} has the highest gas costs. Consider using L2 solutions for frequent transactions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  Batch your transactions to reduce overall gas costs. Your average transaction costs ${data.stats.averageGasCost.toFixed(2)}.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

