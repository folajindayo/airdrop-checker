'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, Rocket, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Stats {
  total: {
    projects: number;
    confirmed: number;
    rumored: number;
    speculative: number;
    expired: number;
  };
  chains: {
    ethereum: number;
    base: number;
    arbitrum: number;
    optimism: number;
    zkSync: number;
    polygon: number;
  };
  criteria: {
    totalCriteria: number;
    avgCriteriaPerProject: number;
  };
  estimated: {
    withValue: number;
    totalEstimatedValue: string;
  };
  snapshots: {
    upcoming: number;
    past: number;
    tbd: number;
  };
  topProjects: Array<{
    name: string;
    status: string;
    chains: string[];
    criteriaCount: number;
    hasSnapshot: boolean;
    hasClaimUrl: boolean;
  }>;
  recentUpdates: Array<{
    name: string;
    status: string;
    updatedAt: Date;
  }>;
}

interface Engagement {
  activeAirdrops: number;
  multiChainProjects: number;
  claimableNow: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');

        const data = await response.json();
        setStats(data.stats);
        setEngagement(data.engagement);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats || !engagement) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load statistics</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Airdrops',
      value: stats.total.projects,
      icon: Rocket,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Tracked projects',
    },
    {
      title: 'Confirmed',
      value: stats.total.confirmed,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Official airdrops',
    },
    {
      title: 'Active Now',
      value: engagement.activeAirdrops,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Ongoing opportunities',
    },
    {
      title: 'Claimable',
      value: engagement.claimableNow,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Ready to claim',
    },
  ];

  const chainData = [
    { name: 'Ethereum', count: stats.chains.ethereum, color: 'bg-blue-500' },
    { name: 'Base', count: stats.chains.base, color: 'bg-blue-600' },
    { name: 'Arbitrum', count: stats.chains.arbitrum, color: 'bg-blue-400' },
    { name: 'Optimism', count: stats.chains.optimism, color: 'bg-red-500' },
    { name: 'zkSync', count: stats.chains.zkSync, color: 'bg-purple-500' },
    { name: 'Polygon', count: stats.chains.polygon, color: 'bg-purple-600' },
  ].filter((chain) => chain.count > 0);

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Airdrop Statistics</h1>
        <p className="text-muted-foreground">
          Global analytics and insights across all tracked airdrops
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chain Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Chain Distribution</CardTitle>
          <CardDescription>
            Airdrops by blockchain network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chainData.map((chain) => {
              const percentage = (chain.count / stats.total.projects) * 100;
              return (
                <div key={chain.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{chain.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {chain.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${chain.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>
              Projects by status category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Confirmed', value: stats.total.confirmed, color: 'bg-green-500' },
                { label: 'Rumored', value: stats.total.rumored, color: 'bg-yellow-500' },
                { label: 'Speculative', value: stats.total.speculative, color: 'bg-blue-500' },
                { label: 'Expired', value: stats.total.expired, color: 'bg-gray-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <Badge variant="secondary">{item.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Snapshot Info */}
        <Card>
          <CardHeader>
            <CardTitle>Snapshot Timeline</CardTitle>
            <CardDescription>
              Snapshot dates status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Upcoming Snapshots</span>
                <Badge className="bg-orange-500">{stats.snapshots.upcoming}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Past Snapshots</span>
                <Badge variant="secondary">{stats.snapshots.past}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">To Be Determined</span>
                <Badge variant="outline">{stats.snapshots.tbd}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Confirmed Airdrops</CardTitle>
              <CardDescription>
                Most notable confirmed opportunities
              </CardDescription>
            </div>
            <Link href="/dashboard">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                View All <ChevronRight className="ml-1 h-3 w-3" />
              </Badge>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topProjects.map((project, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{project.name}</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{project.criteriaCount} criteria</span>
                    {project.chains.length > 0 && (
                      <span>{project.chains.length} chains</span>
                    )}
                    {project.hasClaimUrl && (
                      <Badge variant="outline" className="text-xs">
                        Claimable
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

