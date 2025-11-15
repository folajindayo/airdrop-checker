'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  TrendingUp,
  DollarSign,
  Percent,
  Award,
  Zap,
  Target,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
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

interface ProtocolRevenue {
  protocol: string;
  logo?: string;
  totalEarned: number;
  pendingRewards: number;
  claimedRewards: number;
  apr: number;
  chain: string;
  rewardToken: string;
  lastClaimed?: string;
  nextClaimable?: string;
}

interface RevenueHistory {
  date: string;
  earned: number;
  claimed: number;
}

interface RevenueData {
  totalEarned: number;
  totalPending: number;
  totalClaimed: number;
  averageAPR: number;
  protocols: ProtocolRevenue[];
  history: RevenueHistory[];
  protocolDistribution: { protocol: string; earned: number }[];
  chainDistribution: { chain: string; earned: number }[];
  monthlyEarnings: { month: string; earnings: number }[];
}

interface ProtocolRevenueTrackerProps {
  address: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export function ProtocolRevenueTracker({ address }: ProtocolRevenueTrackerProps) {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y' | 'all'>('90d');

  useEffect(() => {
    if (address) {
      fetchRevenueData();
    }
  }, [address, timeRange]);

  async function fetchRevenueData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/protocol-revenue/${address}?timeRange=${timeRange}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error('Failed to load protocol revenue');
    } finally {
      setLoading(false);
    }
  }

  async function claimRewards(protocol: string) {
    toast.success(`Claiming rewards from ${protocol}...`);
    // Implement actual claim logic
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
        <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No protocol revenue data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['30d', '90d', '1y', 'all'] as const).map((range) => (
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
            <p className="text-sm text-muted-foreground">Total Earned</p>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            ${data.totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Pending Rewards</p>
            <Award className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-600">
            ${data.totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Claimed</p>
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">
            ${data.totalClaimed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Avg APR</p>
            <Percent className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {data.averageAPR.toFixed(2)}%
          </p>
        </Card>
      </div>

      {/* Revenue History Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue History</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.history}>
            <defs>
              <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorClaimed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="earned"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorEarned)"
              name="Earned"
            />
            <Area
              type="monotone"
              dataKey="claimed"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorClaimed)"
              name="Claimed"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Protocol Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Earnings by Protocol</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.protocolDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ protocol, earned }) => `${protocol}: $${(earned / 1000).toFixed(1)}k`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="earned"
              >
                {data.protocolDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Chain Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Earnings by Chain</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.chainDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="chain" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Bar dataKey="earned" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Monthly Earnings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Earnings Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.monthlyEarnings}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Line
              type="monotone"
              dataKey="earnings"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Protocol Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Protocol Revenue Details</h3>
        <div className="space-y-3">
          {data.protocols.map((protocol) => (
            <div
              key={`${protocol.protocol}-${protocol.chain}`}
              className="p-4 bg-muted/50 rounded-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {protocol.logo ? (
                    <img
                      src={protocol.logo}
                      alt={protocol.protocol}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {protocol.protocol.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold">{protocol.protocol}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{protocol.chain}</Badge>
                      <Badge variant="outline">{protocol.rewardToken}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">APR</p>
                  <p className="text-xl font-bold text-green-600">{protocol.apr.toFixed(2)}%</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Earned</p>
                  <p className="font-semibold">${protocol.totalEarned.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pending</p>
                  <p className="font-semibold text-orange-600">
                    ${protocol.pendingRewards.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Claimed</p>
                  <p className="font-semibold text-blue-600">
                    ${protocol.claimedRewards.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {protocol.lastClaimed && (
                    <span>Last claimed: {new Date(protocol.lastClaimed).toLocaleDateString()}</span>
                  )}
                  {protocol.nextClaimable && (
                    <span className="ml-4">
                      Next claimable: {new Date(protocol.nextClaimable).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {protocol.pendingRewards > 0 && (
                  <Button
                    size="sm"
                    onClick={() => claimRewards(protocol.protocol)}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Claim ${protocol.pendingRewards.toFixed(2)}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <div className="flex items-start gap-4">
          <TrendingUp className="h-8 w-8 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Revenue Insights</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Award className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  You have ${data.totalPending.toFixed(2)} in pending rewards ready to claim across {data.protocols.filter(p => p.pendingRewards > 0).length} protocols
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Percent className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>
                  Average APR across all protocols: {data.averageAPR.toFixed(2)}%
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  Total earnings in selected period: ${data.totalEarned.toLocaleString()} ({((data.totalClaimed / data.totalEarned) * 100).toFixed(1)}% claimed)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

