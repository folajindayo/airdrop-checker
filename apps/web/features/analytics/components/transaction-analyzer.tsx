'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  Activity,
  TrendingUp,
  Clock,
  DollarSign,
  Zap,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
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

interface Transaction {
  hash: string;
  timestamp: string;
  type: 'send' | 'receive' | 'swap' | 'contract';
  from: string;
  to: string;
  value: number;
  gasUsed: number;
  gasPrice: number;
  status: 'success' | 'failed';
  chainId: number;
  protocol?: string;
}

interface TransactionPattern {
  hourlyActivity: { hour: number; count: number }[];
  dailyActivity: { day: string; count: number; volume: number }[];
  typeDistribution: { type: string; count: number; percentage: number }[];
  chainDistribution: { chain: string; count: number; percentage: number }[];
  protocolUsage: { protocol: string; count: number; volume: number }[];
}

interface TransactionStats {
  totalTransactions: number;
  successRate: number;
  totalVolume: number;
  totalGasSpent: number;
  averageGasPrice: number;
  mostActiveDay: string;
  mostActiveHour: number;
  uniqueContracts: number;
  uniqueProtocols: number;
}

interface TransactionAnalyzerProps {
  address: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export function TransactionAnalyzer({ address }: TransactionAnalyzerProps) {
  const [data, setData] = useState<{
    transactions: Transaction[];
    patterns: TransactionPattern;
    stats: TransactionStats;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [filterType, setFilterType] = useState<'all' | 'send' | 'receive' | 'swap' | 'contract'>('all');

  useEffect(() => {
    if (address) {
      fetchTransactionData();
    }
  }, [address, timeRange, filterType]);

  async function fetchTransactionData() {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/transaction-analyzer/${address}?timeRange=${timeRange}&filter=${filterType}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      toast.error('Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  }

  async function exportData() {
    if (!data) return;
    
    const csv = convertToCSV(data.transactions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${address.slice(0, 8)}-${Date.now()}.csv`;
    a.click();
    toast.success('Transactions exported');
  }

  function convertToCSV(transactions: Transaction[]): string {
    const headers = ['Hash', 'Timestamp', 'Type', 'From', 'To', 'Value', 'Gas Used', 'Status', 'Chain'];
    const rows = transactions.map((tx) => [
      tx.hash,
      tx.timestamp,
      tx.type,
      tx.from,
      tx.to,
      tx.value,
      tx.gasUsed,
      tx.status,
      tx.chainId,
    ]);
    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No transaction data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <span className="text-sm font-medium flex items-center">Time Range:</span>
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{data.stats.totalTransactions.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.stats.successRate.toFixed(1)}% success rate
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">
            ${data.stats.totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Gas Spent</p>
            <Zap className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold">
            ${data.stats.totalGasSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Avg: {data.stats.averageGasPrice.toFixed(2)} Gwei
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Protocols Used</p>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{data.stats.uniqueProtocols}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.stats.uniqueContracts} unique contracts
          </p>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.patterns.dailyActivity}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="day" className="text-xs" />
            <YAxis yAxisId="left" className="text-xs" />
            <YAxis yAxisId="right" orientation="right" className="text-xs" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorCount)"
              name="Transactions"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="volume"
              stroke="#10b981"
              name="Volume ($)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Hourly Pattern */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Hourly Activity Pattern</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.patterns.hourlyActivity}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="hour" className="text-xs" tickFormatter={(hour) => `${hour}:00`} />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Most active hour: {data.stats.mostActiveHour}:00 UTC
        </p>
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Type Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Transaction Types</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.patterns.typeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percentage }) => `${type}: ${percentage.toFixed(1)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="count"
              >
                {data.patterns.typeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {data.patterns.typeDistribution.map((item, index) => (
              <div key={item.type} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="capitalize">{item.type}</span>
                </div>
                <span className="font-medium">{item.count} ({item.percentage.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Chain Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Chain Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.patterns.chainDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ chain, percentage }) => `${chain}: ${percentage.toFixed(1)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="count"
              >
                {data.patterns.chainDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {data.patterns.chainDistribution.map((item, index) => (
              <div key={item.chain} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{item.chain}</span>
                </div>
                <span className="font-medium">{item.count} ({item.percentage.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Protocol Usage */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Protocols</h3>
        <div className="space-y-3">
          {data.patterns.protocolUsage.slice(0, 10).map((protocol, index) => (
            <div key={protocol.protocol} className="flex items-center gap-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{protocol.protocol}</span>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{protocol.count} txs</span>
                    <span className="mx-2">•</span>
                    <span>${protocol.volume.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${(protocol.count / data.stats.totalTransactions) * 100}%`,
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
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-2">
          {data.transactions.slice(0, 10).map((tx) => (
            <div
              key={tx.hash}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {tx.type === 'send' ? (
                  <ArrowUpRight className="h-5 w-5 text-red-600" />
                ) : tx.type === 'receive' ? (
                  <ArrowDownRight className="h-5 w-5 text-green-600" />
                ) : (
                  <Activity className="h-5 w-5 text-blue-600" />
                )}
                <div>
                  <p className="font-medium capitalize">{tx.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${tx.value.toFixed(2)}</p>
                <Badge variant={tx.status === 'success' ? 'secondary' : 'destructive'} className="text-xs">
                  {tx.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

