'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  Users,
  TrendingUp,
  Copy,
  Star,
  Eye,
  DollarSign,
  Activity,
  Award,
  ThumbsUp,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Trade {
  id: string;
  trader: string;
  traderName: string;
  traderAvatar?: string;
  action: 'buy' | 'sell' | 'swap';
  tokenFrom: string;
  tokenTo: string;
  amount: number;
  price: number;
  timestamp: string;
  profit?: number;
  chain: string;
  verified: boolean;
}

interface Trader {
  address: string;
  name: string;
  avatar?: string;
  followers: number;
  winRate: number;
  totalProfit: number;
  trades: number;
  roi: number;
  verified: boolean;
  specialty: string[];
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  creator: string;
  followers: number;
  performance: number;
  risk: 'low' | 'medium' | 'high';
  trades: number;
  avgReturn: number;
}

interface SocialTradingData {
  recentTrades: Trade[];
  topTraders: Trader[];
  strategies: Strategy[];
  trending: { token: string; mentions: number; sentiment: number }[];
}

export function SocialTradingFeed() {
  const [data, setData] = useState<SocialTradingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'swap'>('all');

  useEffect(() => {
    fetchSocialData();
  }, []);

  async function fetchSocialData() {
    setLoading(true);
    try {
      const response = await fetch('/api/social-trading');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching social trading data:', error);
      toast.error('Failed to load social trading feed');
    } finally {
      setLoading(false);
    }
  }

  function toggleFollow(address: string) {
    setFollowing((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(address)) {
        newSet.delete(address);
        toast.success('Unfollowed trader');
      } else {
        newSet.add(address);
        toast.success('Following trader! 🎯');
      }
      return newSet;
    });
  }

  function copyTrade(trade: Trade) {
    toast.success(`Copying ${trade.action} ${trade.tokenFrom} trade...`);
    // In production, this would execute the trade
  }

  function getActionColor(action: string) {
    switch (action) {
      case 'buy':
        return 'bg-green-600';
      case 'sell':
        return 'bg-red-600';
      case 'swap':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  }

  function getRiskColor(risk: string) {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-600/10';
      case 'medium':
        return 'text-yellow-600 bg-yellow-600/10';
      case 'high':
        return 'text-red-600 bg-red-600/10';
      default:
        return 'text-gray-600 bg-gray-600/10';
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
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No social trading data available</p>
      </Card>
    );
  }

  const filteredTrades =
    filter === 'all' ? data.recentTrades : data.recentTrades.filter((t) => t.action === filter);

  return (
    <div className="space-y-6">
      {/* Top Traders */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🏆 Top Traders</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.topTraders.slice(0, 3).map((trader, index) => (
            <div
              key={trader.address}
              className="p-4 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {trader.avatar ? (
                    <img src={trader.avatar} alt={trader.name} className="h-12 w-12 rounded-full" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{trader.name}</h4>
                      {trader.verified && <Award className="h-4 w-4 text-blue-600" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {trader.followers.toLocaleString()} followers
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Win Rate:</span>
                  <span className="font-semibold text-green-600">{trader.winRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Profit:</span>
                  <span className="font-semibold">${trader.totalProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ROI:</span>
                  <span className="font-semibold text-blue-600">{trader.roi}%</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {trader.specialty.map((spec) => (
                  <Badge key={spec} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
              <Button
                className="w-full"
                variant={following.has(trader.address) ? 'outline' : 'default'}
                onClick={() => toggleFollow(trader.address)}
              >
                {following.has(trader.address) ? 'Following' : 'Follow'}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Trending Tokens */}
      <Card className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
        <h3 className="text-lg font-semibold mb-4">🔥 Trending Tokens</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.trending.map((item) => (
            <div key={item.token} className="p-3 bg-background border rounded-lg">
              <p className="font-semibold mb-1">{item.token}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.mentions} mentions</span>
                <Badge
                  variant="outline"
                  className={item.sentiment > 0 ? 'text-green-600' : 'text-red-600'}
                >
                  {item.sentiment > 0 ? '+' : ''}
                  {item.sentiment}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Trades
        </Button>
        <Button
          variant={filter === 'buy' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('buy')}
        >
          Buys
        </Button>
        <Button
          variant={filter === 'sell' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('sell')}
        >
          Sells
        </Button>
        <Button
          variant={filter === 'swap' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('swap')}
        >
          Swaps
        </Button>
      </div>

      {/* Recent Trades Feed */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
        <div className="space-y-3">
          {filteredTrades.map((trade) => (
            <div
              key={trade.id}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  {trade.traderAvatar ? (
                    <img
                      src={trade.traderAvatar}
                      alt={trade.traderName}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {trade.traderName.substring(0, 2)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{trade.traderName}</p>
                      {trade.verified && <Award className="h-4 w-4 text-blue-600" />}
                      <Badge className={getActionColor(trade.action)}>
                        {trade.action.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{trade.chain}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{trade.tokenFrom}</span>
                      {trade.action === 'swap' && (
                        <>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">{trade.tokenTo}</span>
                        </>
                      )}
                      <span className="text-muted-foreground">
                        {trade.amount.toFixed(4)} @ ${trade.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(trade.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {trade.profit !== undefined && (
                    <div className="text-right mr-2">
                      <p
                        className={`text-lg font-bold ${
                          trade.profit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">P&L</p>
                    </div>
                  )}
                  <Button size="sm" onClick={() => copyTrade(trade)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trading Strategies */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Popular Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.strategies.map((strategy) => (
            <div key={strategy.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold mb-1">{strategy.name}</h4>
                  <Badge className={getRiskColor(strategy.risk)}>
                    {strategy.risk.toUpperCase()} RISK
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    +{strategy.performance}%
                  </p>
                  <p className="text-xs text-muted-foreground">Performance</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
              <div className="flex items-center justify-between text-sm mb-3">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    <Users className="h-4 w-4 inline mr-1" />
                    {strategy.followers.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    <Activity className="h-4 w-4 inline mr-1" />
                    {strategy.trades} trades
                  </span>
                </div>
                <span className="font-semibold text-blue-600">
                  {strategy.avgReturn}% avg return
                </span>
              </div>
              <Button className="w-full" variant="outline">
                <Star className="h-4 w-4 mr-2" />
                Follow Strategy
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-blue-500/10 border-blue-500/20">
        <div className="flex items-start gap-4">
          <Users className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">About Social Trading</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Social trading allows you to follow and copy trades from successful traders in
              real-time. Benefits include:
            </p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Learn from experienced traders and their strategies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Automatically copy trades with customizable parameters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Track performance and adjust your following list</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Always DYOR and manage your own risk tolerance</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

