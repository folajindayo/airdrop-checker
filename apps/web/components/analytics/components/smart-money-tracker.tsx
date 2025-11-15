'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  Brain,
  TrendingUp,
  Target,
  Award,
  Copy,
  ExternalLink,
  Star,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SmartTrader {
  address: string;
  label?: string;
  winRate: number;
  totalTrades: number;
  profitLoss: number;
  roi: number;
  avgHoldTime: number;
  successfulTokens: string[];
  recentTrades: number;
  isFollowing: boolean;
  rank: number;
  score: number;
}

interface TraderTrade {
  hash: string;
  timestamp: string;
  token: string;
  action: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  amount: number;
  profit?: number;
  roi?: number;
  chain: string;
}

interface SmartMoneyData {
  topTraders: SmartTrader[];
  recentTrades: TraderTrade[];
  performanceMetrics: {
    metric: string;
    [key: string]: string | number;
  }[];
  trendingTokens: { token: string; traders: number; avgROI: number }[];
  strategyDistribution: { strategy: string; count: number; avgROI: number }[];
}

export function SmartMoneyTracker() {
  const [data, setData] = useState<SmartMoneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrader, setSelectedTrader] = useState<SmartTrader | null>(null);

  useEffect(() => {
    fetchSmartMoneyData();
  }, []);

  async function fetchSmartMoneyData() {
    setLoading(true);
    try {
      const response = await fetch('/api/smart-money');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching smart money data:', error);
      toast.error('Failed to load smart money data');
    } finally {
      setLoading(false);
    }
  }

  async function toggleFollow(address: string) {
    toast.success('Trader tracking updated');
    // Implement follow/unfollow logic
  }

  async function copyStrategy(address: string) {
    toast.success('Strategy copied! You will receive notifications for this trader\'s moves');
    // Implement copy trading logic
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
        <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No smart money data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Top Traders</p>
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{data.topTraders.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.topTraders.filter(t => t.isFollowing).length} following
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Avg Win Rate</p>
            <Target className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {(data.topTraders.reduce((sum, t) => sum + t.winRate, 0) / data.topTraders.length).toFixed(1)}%
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Avg ROI</p>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {(data.topTraders.reduce((sum, t) => sum + t.roi, 0) / data.topTraders.length).toFixed(0)}%
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Profit</p>
            <Award className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">
            ${(data.topTraders.reduce((sum, t) => sum + t.profitLoss, 0) / 1000000).toFixed(1)}M
          </p>
        </Card>
      </div>

      {/* Top Traders Leaderboard */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Smart Money Leaderboard</h3>
        <div className="space-y-3">
          {data.topTraders.slice(0, 10).map((trader) => (
            <div
              key={trader.address}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              onClick={() => setSelectedTrader(trader)}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 text-white font-bold">
                    #{trader.rank}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: Math.min(5, Math.floor(trader.score / 20)) }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-mono text-sm truncate">{trader.address}</p>
                    {trader.label && <Badge variant="secondary">{trader.label}</Badge>}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Win Rate: </span>
                      <span className="font-semibold text-green-600">{trader.winRate.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ROI: </span>
                      <span className="font-semibold text-blue-600">+{trader.roi.toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">P&L: </span>
                      <span className="font-semibold text-purple-600">
                        ${(trader.profitLoss / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trades: </span>
                      <span className="font-semibold">{trader.totalTrades}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {trader.successfulTokens.slice(0, 4).map((token) => (
                      <Badge key={token} variant="outline" className="text-xs">
                        {token}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyStrategy(trader.address);
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant={trader.isFollowing ? 'default' : 'outline'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollow(trader.address);
                  }}
                >
                  {trader.isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={`https://etherscan.io/address/${trader.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trader Performance Radar */}
      {selectedTrader && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Trader Performance Analysis</h3>
              <p className="text-sm text-muted-foreground font-mono">{selectedTrader.address}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedTrader(null)}>
              ✕
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={[
              { metric: 'Win Rate', value: selectedTrader.winRate },
              { metric: 'ROI', value: Math.min(selectedTrader.roi, 100) },
              { metric: 'Activity', value: Math.min((selectedTrader.recentTrades / 100) * 100, 100) },
              { metric: 'Consistency', value: Math.min((selectedTrader.totalTrades / 500) * 100, 100) },
              { metric: 'Risk Mgmt', value: Math.min((selectedTrader.avgHoldTime / 30) * 100, 100) },
            ]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name={selectedTrader.label || 'Trader'}
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Trending Tokens */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Trending Among Smart Money</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.trendingTokens.map((token) => (
            <div key={token.token} className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-lg">{token.token}</h4>
                <Badge variant="secondary">{token.traders} traders</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg ROI</span>
                <span className="font-semibold text-green-600">+{token.avgROI.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Strategy Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Strategy Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.strategyDistribution}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="strategy" className="text-xs" />
            <YAxis yAxisId="left" className="text-xs" />
            <YAxis yAxisId="right" orientation="right" className="text-xs" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Traders" />
            <Bar yAxisId="right" dataKey="avgROI" fill="#10b981" name="Avg ROI %" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Successful Trades */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Winning Trades</h3>
        <div className="space-y-3">
          {data.recentTrades.filter(t => t.profit && t.profit > 0).slice(0, 10).map((trade) => (
            <div key={trade.hash} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={trade.action === 'buy' ? 'default' : 'secondary'}>
                    {trade.action.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{trade.chain}</Badge>
                  <span className="font-semibold">{trade.token}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Entry: ${trade.entryPrice.toFixed(4)}
                  {trade.exitPrice && ` → Exit: $${trade.exitPrice.toFixed(4)}`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(trade.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                {trade.profit && (
                  <p className="font-semibold text-green-600">+${trade.profit.toFixed(2)}</p>
                )}
                {trade.roi && (
                  <p className="text-xs text-green-600">+{trade.roi.toFixed(1)}%</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
        <div className="flex items-start gap-4">
          <Brain className="h-8 w-8 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Smart Money Insights</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>
                  Top traders are accumulating: {data.trendingTokens.slice(0, 3).map(t => t.token).join(', ')}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  Average win rate of top 10 traders: {(data.topTraders.slice(0, 10).reduce((sum, t) => sum + t.winRate, 0) / 10).toFixed(1)}%
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Award className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>
                  Copy the strategies of top performers to potentially replicate their success
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

