'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Input } from '@/components/ui/input';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Search,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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

interface TokenHolding {
  symbol: string;
  name: string;
  balance: number;
  valueUSD: number;
  price: number;
  change24h: number;
  change7d: number;
  chain: string;
  logo?: string;
  allocation: number;
  firstSeen: string;
  profitLoss?: number;
  profitLossPercent?: number;
}

interface PriceHistory {
  date: string;
  price: number;
}

interface HoldingsData {
  totalValue: number;
  totalTokens: number;
  total24hChange: number;
  holdings: TokenHolding[];
  chainDistribution: { chain: string; value: number; percentage: number }[];
  priceHistory: Record<string, PriceHistory[]>;
}

interface TokenHoldingsAnalyzerProps {
  address: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];

export function TokenHoldingsAnalyzer({ address }: TokenHoldingsAnalyzerProps) {
  const [data, setData] = useState<HoldingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'value' | 'change' | 'name'>('value');
  const [selectedToken, setSelectedToken] = useState<TokenHolding | null>(null);

  useEffect(() => {
    if (address) {
      fetchHoldingsData();
    }
  }, [address]);

  async function fetchHoldingsData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/token-holdings/${address}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching holdings data:', error);
      toast.error('Failed to load token holdings');
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
        <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No token holdings found</p>
      </Card>
    );
  }

  // Filter and sort holdings
  const filteredHoldings = data.holdings.filter(
    (holding) =>
      holding.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      holding.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    if (sortBy === 'value') return b.valueUSD - a.valueUSD;
    if (sortBy === 'change') return b.change24h - a.change24h;
    if (sortBy === 'name') return a.symbol.localeCompare(b.symbol);
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 col-span-1 md:col-span-2">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <p className="text-4xl font-bold">
            ${data.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {data.total24hChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`text-sm font-medium ${
                data.total24hChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {data.total24hChange >= 0 ? '+' : ''}
              {data.total24hChange.toFixed(2)}% (24h)
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Tokens</p>
            <Coins className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{data.totalTokens}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Chains</p>
            <Filter className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">{data.chainDistribution.length}</p>
        </Card>
      </div>

      {/* Portfolio Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Token Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.holdings.slice(0, 7)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ symbol, allocation }) => `${symbol}: ${allocation.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="valueUSD"
              >
                {data.holdings.slice(0, 7).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Chain Distribution</h3>
          <div className="space-y-4">
            {data.chainDistribution.map((chain, index) => (
              <div key={chain.chain}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{chain.chain}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${chain.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{chain.percentage.toFixed(1)}%</p>
                  </div>
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
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Search and Sort */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'value' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('value')}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Value
            </Button>
            <Button
              variant={sortBy === 'change' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('change')}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Change
            </Button>
            <Button
              variant={sortBy === 'name' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('name')}
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Name
            </Button>
          </div>
        </div>
      </Card>

      {/* Holdings Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Token Holdings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-sm font-semibold">Token</th>
                <th className="text-right p-3 text-sm font-semibold">Balance</th>
                <th className="text-right p-3 text-sm font-semibold">Value</th>
                <th className="text-right p-3 text-sm font-semibold">Price</th>
                <th className="text-right p-3 text-sm font-semibold">24h Change</th>
                <th className="text-right p-3 text-sm font-semibold">7d Change</th>
                <th className="text-right p-3 text-sm font-semibold">P&L</th>
                <th className="text-right p-3 text-sm font-semibold">Allocation</th>
              </tr>
            </thead>
            <tbody>
              {sortedHoldings.map((holding) => (
                <tr
                  key={`${holding.symbol}-${holding.chain}`}
                  className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedToken(holding)}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {holding.logo ? (
                        <img
                          src={holding.logo}
                          alt={holding.symbol}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                          {holding.symbol.substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{holding.symbol}</p>
                        <p className="text-xs text-muted-foreground">{holding.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right p-3">
                    <p className="font-medium">{holding.balance.toFixed(4)}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {holding.chain}
                    </Badge>
                  </td>
                  <td className="text-right p-3 font-semibold">
                    ${holding.valueUSD.toLocaleString()}
                  </td>
                  <td className="text-right p-3 text-sm">
                    ${holding.price.toLocaleString()}
                  </td>
                  <td className="text-right p-3">
                    <span
                      className={`font-medium ${
                        holding.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {holding.change24h >= 0 ? '+' : ''}
                      {holding.change24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className="text-right p-3">
                    <span
                      className={`font-medium ${
                        holding.change7d >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {holding.change7d >= 0 ? '+' : ''}
                      {holding.change7d.toFixed(2)}%
                    </span>
                  </td>
                  <td className="text-right p-3">
                    {holding.profitLoss !== undefined && (
                      <div>
                        <p
                          className={`font-medium ${
                            holding.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {holding.profitLoss >= 0 ? '+' : ''}$
                          {Math.abs(holding.profitLoss).toFixed(2)}
                        </p>
                        <p
                          className={`text-xs ${
                            (holding.profitLossPercent || 0) >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          ({holding.profitLossPercent?.toFixed(1)}%)
                        </p>
                      </div>
                    )}
                  </td>
                  <td className="text-right p-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${holding.allocation}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{holding.allocation.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Selected Token Details */}
      {selectedToken && data.priceHistory[selectedToken.symbol] && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {selectedToken.logo ? (
                <img
                  src={selectedToken.logo}
                  alt={selectedToken.symbol}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {selectedToken.symbol.substring(0, 2)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">{selectedToken.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedToken.symbol}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedToken(null)}>
              ✕
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.priceHistory[selectedToken.symbol]}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}

