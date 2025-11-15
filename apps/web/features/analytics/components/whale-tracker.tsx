'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Input } from '@/components/ui/input';
import {
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRight,
  Bell,
  Search,
  Filter,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface WhaleTransaction {
  hash: string;
  timestamp: string;
  from: string;
  to: string;
  type: 'buy' | 'sell' | 'transfer';
  token: string;
  amount: number;
  valueUSD: number;
  chain: string;
  dex?: string;
}

interface WhaleWallet {
  address: string;
  label?: string;
  totalValue: number;
  change24h: number;
  topHoldings: string[];
  recentActivity: number;
  isFollowing: boolean;
}

interface WhaleData {
  topWhales: WhaleWallet[];
  recentTransactions: WhaleTransaction[];
  whaleActivity: { date: string; buys: number; sells: number; transfers: number }[];
  tokenFlow: { token: string; netFlow: number; whaleCount: number }[];
  followedWhales: WhaleWallet[];
}

export function WhaleTracker() {
  const [data, setData] = useState<WhaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell' | 'transfer'>('all');
  const [minValue, setMinValue] = useState(10000);

  useEffect(() => {
    fetchWhaleData();
  }, []);

  async function fetchWhaleData() {
    setLoading(true);
    try {
      const response = await fetch('/api/whale-tracker');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching whale data:', error);
      toast.error('Failed to load whale data');
    } finally {
      setLoading(false);
    }
  }

  async function toggleFollow(address: string) {
    toast.success('Whale tracking updated');
    // Implement follow/unfollow logic
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
        <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No whale data available</p>
      </Card>
    );
  }

  const filteredTransactions = data.recentTransactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesValue = tx.valueUSD >= minValue;
    const matchesSearch =
      searchQuery === '' ||
      tx.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesValue && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Active Whales</p>
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{data.topWhales.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.followedWhales.length} following
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">24h Transactions</p>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">{data.recentTransactions.length}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">
            ${(data.recentTransactions.reduce((sum, tx) => sum + tx.valueUSD, 0) / 1000000).toFixed(1)}M
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Avg Whale Value</p>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">
            ${(data.topWhales.reduce((sum, w) => sum + w.totalValue, 0) / data.topWhales.length / 1000000).toFixed(1)}M
          </p>
        </Card>
      </div>

      {/* Whale Activity Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Whale Activity Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.whaleActivity}>
            <defs>
              <linearGradient id="colorBuys" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSells" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="buys"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorBuys)"
              name="Buys"
            />
            <Area
              type="monotone"
              dataKey="sells"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorSells)"
              name="Sells"
            />
            <Line type="monotone" dataKey="transfers" stroke="#3b82f6" name="Transfers" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Whales */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Whale Wallets</h3>
        <div className="space-y-3">
          {data.topWhales.slice(0, 10).map((whale, index) => (
            <div
              key={whale.address}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-mono text-sm truncate">{whale.address}</p>
                    {whale.label && <Badge variant="secondary">{whale.label}</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Portfolio: ${(whale.totalValue / 1000000).toFixed(2)}M</span>
                    <span className={whale.change24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {whale.change24h >= 0 ? '+' : ''}
                      {whale.change24h.toFixed(2)}% (24h)
                    </span>
                    <span>{whale.recentActivity} recent txs</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {whale.topHoldings.slice(0, 3).map((token) => (
                      <Badge key={token} variant="outline" className="text-xs">
                        {token}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={whale.isFollowing ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFollow(whale.address)}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {whale.isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={`https://etherscan.io/address/${whale.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Token Flow Analysis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Token Flow Analysis</h3>
        <div className="space-y-3">
          {data.tokenFlow.map((token) => (
            <div key={token.token} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  {token.token.substring(0, 2)}
                </div>
                <div>
                  <p className="font-semibold">{token.token}</p>
                  <p className="text-xs text-muted-foreground">{token.whaleCount} whales active</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {token.netFlow >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                  <span
                    className={`font-semibold ${
                      token.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {token.netFlow >= 0 ? '+' : ''}${Math.abs(token.netFlow / 1000).toFixed(0)}k
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Net flow</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button
              variant={filterType === 'buy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('buy')}
            >
              Buys
            </Button>
            <Button
              variant={filterType === 'sell' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('sell')}
            >
              Sells
            </Button>
            <Button
              variant={filterType === 'transfer' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('transfer')}
            >
              Transfers
            </Button>
          </div>
          <select
            value={minValue}
            onChange={(e) => setMinValue(Number(e.target.value))}
            className="px-3 py-2 bg-background border rounded-md text-sm"
          >
            <option value={1000}>Min $1k</option>
            <option value={10000}>Min $10k</option>
            <option value={100000}>Min $100k</option>
            <option value={1000000}>Min $1M</option>
          </select>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Whale Transactions</h3>
        <div className="space-y-3">
          {filteredTransactions.slice(0, 20).map((tx) => (
            <div
              key={tx.hash}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={
                      tx.type === 'buy'
                        ? 'default'
                        : tx.type === 'sell'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className={
                      tx.type === 'buy'
                        ? 'bg-green-600'
                        : tx.type === 'sell'
                        ? 'bg-red-600'
                        : ''
                    }
                  >
                    {tx.type.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{tx.chain}</Badge>
                  {tx.dex && <Badge variant="secondary">{tx.dex}</Badge>}
                </div>
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span className="font-mono text-xs truncate max-w-[120px]">{tx.from}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-mono text-xs truncate max-w-[120px]">{tx.to}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {tx.amount.toFixed(2)} {tx.token}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(tx.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="text-lg font-bold">${tx.valueUSD.toLocaleString()}</p>
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex items-start gap-4">
          <Eye className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Whale Insights</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  Top whales are accumulating: {data.tokenFlow.filter(t => t.netFlow > 0).map(t => t.token).join(', ')}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingDown className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>
                  Heavy selling detected in: {data.tokenFlow.filter(t => t.netFlow < 0).map(t => t.token).join(', ')}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Bell className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  Follow {data.topWhales.filter(w => !w.isFollowing).length} more whales to get real-time alerts
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

