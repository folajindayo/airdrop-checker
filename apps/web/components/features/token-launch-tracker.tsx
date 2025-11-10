'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  Rocket,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Bell,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

interface TokenLaunch {
  name: string;
  symbol: string;
  logo?: string;
  launchDate: string;
  status: 'upcoming' | 'live' | 'ended';
  chain: string;
  platform: string;
  hardCap: number;
  softCap: number;
  raised: number;
  participants: number;
  price: number;
  totalSupply: number;
  allocation: {
    presale: number;
    liquidity: number;
    team: number;
    marketing: number;
  };
  socials: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
  verified: boolean;
  audited: boolean;
  kyc: boolean;
  rating: number;
}

interface LaunchStats {
  upcomingLaunches: number;
  liveLaunches: number;
  totalRaised: number;
  avgRating: number;
}

interface TokenLaunchData {
  stats: LaunchStats;
  launches: TokenLaunch[];
  trending: TokenLaunch[];
  recentlyLaunched: TokenLaunch[];
}

export function TokenLaunchTracker() {
  const [data, setData] = useState<TokenLaunchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'ended'>('all');
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLaunchData();
  }, []);

  async function fetchLaunchData() {
    setLoading(true);
    try {
      const response = await fetch('/api/token-launches');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching launch data:', error);
      toast.error('Failed to load token launches');
    } finally {
      setLoading(false);
    }
  }

  function toggleWatchlist(symbol: string) {
    setWatchlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(symbol)) {
        newSet.delete(symbol);
        toast.success(`Removed ${symbol} from watchlist`);
      } else {
        newSet.add(symbol);
        toast.success(`Added ${symbol} to watchlist`);
      }
      return newSet;
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-600';
      case 'live':
        return 'bg-green-600';
      case 'ended':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  }

  function getTimeUntilLaunch(launchDate: string) {
    const now = new Date();
    const launch = new Date(launchDate);
    const diff = launch.getTime() - now.getTime();
    
    if (diff < 0) return 'Launched';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
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
        <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No token launches available</p>
      </Card>
    );
  }

  const filteredLaunches = filter === 'all' 
    ? data.launches 
    : data.launches.filter(l => l.status === filter);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Upcoming</p>
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{data.stats.upcomingLaunches}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Live Now</p>
            <Rocket className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{data.stats.liveLaunches}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Raised</p>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">
            ${(data.stats.totalRaised / 1000000).toFixed(1)}M
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Avg Rating</p>
            <Star className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold">{data.stats.avgRating.toFixed(1)}/5</p>
        </Card>
      </div>

      {/* Trending Launches */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🔥 Trending Launches</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.trending.map((launch) => (
            <div
              key={launch.symbol}
              className="p-4 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {launch.logo ? (
                    <img src={launch.logo} alt={launch.name} className="h-10 w-10 rounded-full" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                      {launch.symbol.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold">{launch.name}</h4>
                    <p className="text-xs text-muted-foreground">{launch.symbol}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(launch.status)}>
                  {launch.status.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Launch:</span>
                  <span className="font-medium">{getTimeUntilLaunch(launch.launchDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < launch.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
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
          All
        </Button>
        <Button
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </Button>
        <Button
          variant={filter === 'live' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('live')}
        >
          Live
        </Button>
        <Button
          variant={filter === 'ended' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('ended')}
        >
          Ended
        </Button>
      </div>

      {/* Launch List */}
      <div className="space-y-4">
        {filteredLaunches.map((launch) => (
          <Card key={launch.symbol} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {launch.logo ? (
                  <img src={launch.logo} alt={launch.name} className="h-16 w-16 rounded-full" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {launch.symbol.substring(0, 2)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">{launch.name}</h3>
                    <Badge variant="secondary">{launch.symbol}</Badge>
                    <Badge className={getStatusColor(launch.status)}>
                      {launch.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{launch.chain}</span>
                    <span>•</span>
                    <span>{launch.platform}</span>
                    {launch.verified && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Verified
                        </Badge>
                      </>
                    )}
                    {launch.audited && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        Audited
                      </Badge>
                    )}
                    {launch.kyc && (
                      <Badge variant="outline" className="text-purple-600 border-purple-600">
                        KYC
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={watchlist.has(launch.symbol) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleWatchlist(launch.symbol)}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {watchlist.has(launch.symbol) ? 'Watching' : 'Watch'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Launch Date</p>
                <p className="font-semibold">
                  {new Date(launch.launchDate).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">{getTimeUntilLaunch(launch.launchDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Price</p>
                <p className="font-semibold">${launch.price.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Raised / Hard Cap</p>
                <p className="font-semibold">
                  ${(launch.raised / 1000).toFixed(0)}k / ${(launch.hardCap / 1000).toFixed(0)}k
                </p>
                <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${(launch.raised / launch.hardCap) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Participants</p>
                <p className="font-semibold flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {launch.participants.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Presale</p>
                <p className="text-sm font-medium">{launch.allocation.presale}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Liquidity</p>
                <p className="text-sm font-medium">{launch.allocation.liquidity}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Team</p>
                <p className="text-sm font-medium">{launch.allocation.team}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Marketing</p>
                <p className="text-sm font-medium">{launch.allocation.marketing}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {launch.socials.website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={launch.socials.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              {launch.socials.twitter && (
                <Button variant="outline" size="sm" asChild>
                  <a href={launch.socials.twitter} target="_blank" rel="noopener noreferrer">
                    Twitter
                  </a>
                </Button>
              )}
              {launch.socials.telegram && (
                <Button variant="outline" size="sm" asChild>
                  <a href={launch.socials.telegram} target="_blank" rel="noopener noreferrer">
                    Telegram
                  </a>
                </Button>
              )}
              {launch.status === 'live' && (
                <Button className="ml-auto">
                  <Rocket className="h-4 w-4 mr-2" />
                  Participate Now
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Warning */}
      <Card className="p-6 bg-yellow-500/10 border-yellow-500/20">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-8 w-8 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Investment Warning</h3>
            <p className="text-sm text-muted-foreground">
              Token launches carry high risk. Always DYOR (Do Your Own Research), verify team credentials,
              check audits, and never invest more than you can afford to lose. Beware of scams and rug pulls.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

