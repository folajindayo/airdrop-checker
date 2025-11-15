'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  Bridge,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
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
  Sankey,
} from 'recharts';

interface BridgeTransaction {
  hash: string;
  timestamp: string;
  bridge: string;
  fromChain: string;
  toChain: string;
  token: string;
  amount: number;
  valueUSD: number;
  fee: number;
  status: 'completed' | 'pending' | 'failed';
  duration?: number; // in minutes
}

interface BridgeStats {
  totalBridges: number;
  totalVolume: number;
  totalFees: number;
  averageBridgeSize: number;
  mostUsedBridge: string;
  mostBridgedToken: string;
  averageDuration: number;
  successRate: number;
}

interface BridgeActivityData {
  stats: BridgeStats;
  transactions: BridgeTransaction[];
  bridgeDistribution: { bridge: string; count: number; volume: number }[];
  chainFlow: { source: string; target: string; value: number }[];
  tokenDistribution: { token: string; count: number; volume: number }[];
  dailyVolume: { date: string; volume: number; bridges: number }[];
  routeAnalysis: { route: string; count: number; avgFee: number }[];
}

interface BridgeActivityTrackerProps {
  address: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export function BridgeActivityTracker({ address }: BridgeActivityTrackerProps) {
  const [data, setData] = useState<BridgeActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  useEffect(() => {
    if (address) {
      fetchBridgeData();
    }
  }, [address, timeRange]);

  async function fetchBridgeData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/bridge-activity/${address}?timeRange=${timeRange}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching bridge data:', error);
      toast.error('Failed to load bridge activity');
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
        <Bridge className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No bridge activity found</p>
      </Card>
    );
  }

  const filteredTransactions = statusFilter === 'all'
    ? data.transactions
    : data.transactions.filter(tx => tx.status === statusFilter);

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
            <p className="text-sm text-muted-foreground">Total Bridges</p>
            <Bridge className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{data.stats.totalBridges}</p>
          <p className="text-xs text-muted-foreground mt-1">
            ${data.stats.totalVolume.toLocaleString()} volume
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Fees</p>
            <DollarSign className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold">
            ${data.stats.totalFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {((data.stats.totalFees / data.stats.totalVolume) * 100).toFixed(2)}% of volume
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Avg Duration</p>
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{data.stats.averageDuration.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground mt-1">minutes</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {data.stats.successRate.toFixed(1)}%
          </p>
        </Card>
      </div>

      {/* Daily Volume Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Bridge Volume</h3>
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
                name === 'volume' ? 'Volume' : 'Bridges',
              ]}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="volume" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Volume" />
            <Line yAxisId="right" type="monotone" dataKey="bridges" stroke="#10b981" strokeWidth={2} name="Bridges" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bridge Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Bridge Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.bridgeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ bridge, count }) => `${bridge}: ${count}`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="count"
              >
                {data.bridgeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {data.bridgeDistribution.map((item, index) => (
              <div key={item.bridge} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{item.bridge}</span>
                </div>
                <span className="font-medium">{item.count} bridges · ${(item.volume / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Token Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Token Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.tokenDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="token" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Popular Routes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Popular Routes</h3>
        <div className="space-y-3">
          {data.routeAnalysis.slice(0, 10).map((route, index) => (
            <div key={route.route} className="flex items-center gap-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{route.route}</span>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{route.count} bridges</span>
                    <span className="mx-2">•</span>
                    <span>Avg fee: ${route.avgFee.toFixed(2)}</span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                    style={{
                      width: `${(route.count / data.routeAnalysis[0].count) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Bridge Transactions</h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1 bg-background border rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="space-y-3">
          {filteredTransactions.slice(0, 10).map((tx) => (
            <div
              key={tx.hash}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{tx.bridge}</Badge>
                  {tx.status === 'completed' && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                  {tx.status === 'pending' && (
                    <Badge variant="default" className="bg-yellow-600">
                      <Loader className="h-3 w-3 mr-1 animate-spin" />
                      Pending
                    </Badge>
                  )}
                  {tx.status === 'failed' && (
                    <Badge variant="default" className="bg-red-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span className="font-medium">{tx.fromChain}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{tx.toChain}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{tx.amount.toFixed(4)} {tx.token}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(tx.timestamp).toLocaleString()}
                  {tx.duration && ` • Duration: ${tx.duration} min`}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold">${tx.valueUSD.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Fee: ${tx.fee.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <div className="flex items-start gap-4">
          <Bridge className="h-8 w-8 text-purple-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Bridge Insights</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>
                  Most used bridge: {data.stats.mostUsedBridge} with {data.bridgeDistribution.find(b => b.bridge === data.stats.mostUsedBridge)?.count} transactions
                </span>
              </li>
              <li className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  Most bridged token: {data.stats.mostBridgedToken} · Average bridge size: ${data.stats.averageBridgeSize.toLocaleString()}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  Average bridge duration: {data.stats.averageDuration.toFixed(0)} minutes · Success rate: {data.stats.successRate.toFixed(1)}%
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

