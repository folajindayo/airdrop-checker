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
  Layers,
  Coins,
  Lock,
  Droplets,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LendingPosition {
  protocol: string;
  asset: string;
  supplied: number;
  suppliedUSD: number;
  borrowed: number;
  borrowedUSD: number;
  apy: number;
  healthFactor?: number;
  chain: string;
}

interface StakingPosition {
  protocol: string;
  asset: string;
  staked: number;
  stakedUSD: number;
  rewards: number;
  rewardsUSD: number;
  apy: number;
  lockupEnd?: string;
  chain: string;
}

interface LPPosition {
  protocol: string;
  pair: string;
  token0: string;
  token1: string;
  liquidity: number;
  liquidityUSD: number;
  fees24h: number;
  apr: number;
  chain: string;
}

interface DeFiPositionData {
  totalValue: number;
  lendingValue: number;
  stakingValue: number;
  lpValue: number;
  totalRewards: number;
  lending: LendingPosition[];
  staking: StakingPosition[];
  liquidityPools: LPPosition[];
  protocolDistribution: { protocol: string; value: number }[];
  chainDistribution: { chain: string; value: number }[];
}

interface DeFiPositionTrackerProps {
  address: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export function DeFiPositionTracker({ address }: DeFiPositionTrackerProps) {
  const [data, setData] = useState<DeFiPositionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lending' | 'staking' | 'lp'>('lending');

  useEffect(() => {
    if (address) {
      fetchDeFiPositions();
    }
  }, [address]);

  async function fetchDeFiPositions() {
    setLoading(true);
    try {
      const response = await fetch(`/api/defi-positions/${address}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching DeFi positions:', error);
      toast.error('Failed to load DeFi positions');
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
        <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No DeFi positions found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6 col-span-1 md:col-span-2">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total DeFi Value</p>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <p className="text-4xl font-bold">
            ${data.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-2 mt-2 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Active in {data.protocolDistribution.length} protocols</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Lending</p>
            <Coins className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">
            ${data.lendingValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{data.lending.length} positions</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Staking</p>
            <Lock className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold">
            ${data.stakingValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{data.staking.length} positions</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Liquidity</p>
            <Droplets className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold">
            ${data.lpValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{data.liquidityPools.length} pools</p>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Protocol Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.protocolDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ protocol, value }) =>
                  `${protocol}: $${(value / 1000).toFixed(1)}k`
                }
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {data.protocolDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Chain Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.chainDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="chain" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'lending' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('lending')}
        >
          <Coins className="h-4 w-4 mr-2" />
          Lending ({data.lending.length})
        </Button>
        <Button
          variant={activeTab === 'staking' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('staking')}
        >
          <Lock className="h-4 w-4 mr-2" />
          Staking ({data.staking.length})
        </Button>
        <Button
          variant={activeTab === 'lp' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('lp')}
        >
          <Droplets className="h-4 w-4 mr-2" />
          Liquidity ({data.liquidityPools.length})
        </Button>
      </div>

      {/* Lending Positions */}
      {activeTab === 'lending' && (
        <div className="space-y-3">
          {data.lending.map((position, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-semibold">{position.protocol}</h4>
                    <Badge variant="secondary">{position.chain}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{position.asset}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">APY</p>
                  <p className="text-2xl font-bold text-green-600">{position.apy.toFixed(2)}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Supplied</p>
                  <p className="font-semibold">{position.supplied.toFixed(4)} {position.asset}</p>
                  <p className="text-xs text-muted-foreground">${position.suppliedUSD.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Borrowed</p>
                  <p className="font-semibold">{position.borrowed.toFixed(4)} {position.asset}</p>
                  <p className="text-xs text-muted-foreground">${position.borrowedUSD.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Net Position</p>
                  <p className="font-semibold">
                    ${(position.suppliedUSD - position.borrowedUSD).toLocaleString()}
                  </p>
                </div>
                {position.healthFactor && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Health Factor</p>
                    <p
                      className={`font-semibold ${
                        position.healthFactor > 2
                          ? 'text-green-600'
                          : position.healthFactor > 1.5
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {position.healthFactor.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Staking Positions */}
      {activeTab === 'staking' && (
        <div className="space-y-3">
          {data.staking.map((position, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-semibold">{position.protocol}</h4>
                    <Badge variant="secondary">{position.chain}</Badge>
                    {position.lockupEnd && (
                      <Badge variant="outline">
                        Locked until {new Date(position.lockupEnd).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{position.asset}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">APY</p>
                  <p className="text-2xl font-bold text-purple-600">{position.apy.toFixed(2)}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Staked</p>
                  <p className="font-semibold">{position.staked.toFixed(4)} {position.asset}</p>
                  <p className="text-xs text-muted-foreground">${position.stakedUSD.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pending Rewards</p>
                  <p className="font-semibold">{position.rewards.toFixed(4)} {position.asset}</p>
                  <p className="text-xs text-muted-foreground">${position.rewardsUSD.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Value</p>
                  <p className="font-semibold">
                    ${(position.stakedUSD + position.rewardsUSD).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Liquidity Pool Positions */}
      {activeTab === 'lp' && (
        <div className="space-y-3">
          {data.liquidityPools.map((position, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-semibold">{position.protocol}</h4>
                    <Badge variant="secondary">{position.chain}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{position.pair}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">APR</p>
                  <p className="text-2xl font-bold text-green-600">{position.apr.toFixed(2)}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Liquidity</p>
                  <p className="font-semibold">${position.liquidityUSD.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">24h Fees</p>
                  <p className="font-semibold text-green-600">${position.fees24h.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Token 0</p>
                  <p className="font-semibold">{position.token0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Token 1</p>
                  <p className="font-semibold">{position.token1}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Total Rewards Card */}
      {data.totalRewards > 0 && (
        <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Pending Rewards</p>
              <p className="text-3xl font-bold">${data.totalRewards.toLocaleString()}</p>
            </div>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Claim All
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

