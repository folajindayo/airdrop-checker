'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Input } from '@/components/ui/input';
import {
  TrendingUp,
  DollarSign,
  Percent,
  Zap,
  Shield,
  AlertTriangle,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';

interface YieldOpportunity {
  protocol: string;
  pool: string;
  apy: number;
  tvl: number;
  risk: 'low' | 'medium' | 'high';
  chain: string;
  tokens: string[];
  minDeposit: number;
  lockPeriod?: number;
  rewards: string[];
  verified: boolean;
  audited: boolean;
  logo?: string;
}

interface YieldStrategy {
  name: string;
  description: string;
  expectedAPY: number;
  risk: 'low' | 'medium' | 'high';
  protocols: string[];
  estimatedGas: number;
  steps: string[];
}

interface YieldData {
  topOpportunities: YieldOpportunity[];
  strategies: YieldStrategy[];
  apyTrends: { date: string; avgAPY: number; topAPY: number }[];
  riskReward: { protocol: string; apy: number; risk: number; tvl: number }[];
  chainComparison: { chain: string; avgAPY: number; opportunities: number }[];
}

export function YieldOptimizer() {
  const [data, setData] = useState<YieldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [minAPY, setMinAPY] = useState(0);
  const [depositAmount, setDepositAmount] = useState(10000);

  useEffect(() => {
    fetchYieldData();
  }, []);

  async function fetchYieldData() {
    setLoading(true);
    try {
      const response = await fetch('/api/yield-optimizer');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching yield data:', error);
      toast.error('Failed to load yield opportunities');
    } finally {
      setLoading(false);
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
        <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No yield opportunities available</p>
      </Card>
    );
  }

  const filteredOpportunities = data.topOpportunities.filter((opp) => {
    const matchesRisk = filterRisk === 'all' || opp.risk === filterRisk;
    const matchesAPY = opp.apy >= minAPY;
    const matchesSearch =
      searchQuery === '' ||
      opp.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.pool.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.tokens.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRisk && matchesAPY && matchesSearch;
  });

  const estimatedEarnings = (depositAmount * (filteredOpportunities[0]?.apy || 0)) / 100;

  return (
    <div className="space-y-6">
      {/* Calculator */}
      <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <h3 className="text-lg font-semibold mb-4">Yield Calculator</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Deposit Amount</label>
            <Input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
              placeholder="10000"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Best APY Available</label>
            <div className="h-10 flex items-center px-3 bg-background border rounded-md">
              <span className="text-2xl font-bold text-green-600">
                {filteredOpportunities[0]?.apy.toFixed(2) || 0}%
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Estimated Yearly Earnings</label>
            <div className="h-10 flex items-center px-3 bg-background border rounded-md">
              <span className="text-2xl font-bold text-blue-600">
                ${estimatedEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Top APY</p>
            <Percent className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {Math.max(...data.topOpportunities.map((o) => o.apy)).toFixed(2)}%
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Avg APY</p>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">
            {(data.topOpportunities.reduce((sum, o) => sum + o.apy, 0) / data.topOpportunities.length).toFixed(2)}%
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Opportunities</p>
            <Zap className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">{data.topOpportunities.length}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total TVL</p>
            <DollarSign className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold">
            ${(data.topOpportunities.reduce((sum, o) => sum + o.tvl, 0) / 1000000).toFixed(0)}M
          </p>
        </Card>
      </div>

      {/* APY Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">APY Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.apyTrends}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" tickFormatter={(value) => `${value}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number) => `${value.toFixed(2)}%`}
            />
            <Legend />
            <Line type="monotone" dataKey="avgAPY" stroke="#3b82f6" strokeWidth={2} name="Avg APY" />
            <Line type="monotone" dataKey="topAPY" stroke="#10b981" strokeWidth={2} name="Top APY" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Risk/Reward Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Risk vs Reward Analysis</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              dataKey="risk"
              name="Risk"
              className="text-xs"
              domain={[0, 10]}
              label={{ value: 'Risk Level', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="apy"
              name="APY"
              className="text-xs"
              tickFormatter={(value) => `${value}%`}
              label={{ value: 'APY %', angle: -90, position: 'insideLeft' }}
            />
            <ZAxis type="number" dataKey="tvl" range={[100, 1000]} name="TVL" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: any, name: string) => {
                if (name === 'APY') return `${value.toFixed(2)}%`;
                if (name === 'TVL') return `$${(value / 1000000).toFixed(1)}M`;
                return value;
              }}
            />
            <Scatter name="Opportunities" data={data.riskReward} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search protocols, pools, tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterRisk === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterRisk('all')}
            >
              All Risk
            </Button>
            <Button
              variant={filterRisk === 'low' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterRisk('low')}
            >
              Low
            </Button>
            <Button
              variant={filterRisk === 'medium' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterRisk('medium')}
            >
              Medium
            </Button>
            <Button
              variant={filterRisk === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterRisk('high')}
            >
              High
            </Button>
          </div>
          <select
            value={minAPY}
            onChange={(e) => setMinAPY(Number(e.target.value))}
            className="px-3 py-2 bg-background border rounded-md text-sm"
          >
            <option value={0}>Min APY: 0%</option>
            <option value={5}>Min APY: 5%</option>
            <option value={10}>Min APY: 10%</option>
            <option value={20}>Min APY: 20%</option>
            <option value={50}>Min APY: 50%</option>
          </select>
        </div>
      </Card>

      {/* Top Opportunities */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Yield Opportunities</h3>
        <div className="space-y-3">
          {filteredOpportunities.map((opp, index) => (
            <div
              key={`${opp.protocol}-${opp.pool}`}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 text-white font-bold">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{opp.protocol}</h4>
                    <Badge variant="secondary">{opp.chain}</Badge>
                    <Badge className={getRiskColor(opp.risk)}>{opp.risk.toUpperCase()}</Badge>
                    {opp.verified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {opp.audited && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        Audited
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{opp.pool}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>TVL: ${(opp.tvl / 1000000).toFixed(1)}M</span>
                    <span>Min: ${opp.minDeposit.toLocaleString()}</span>
                    {opp.lockPeriod && <span>Lock: {opp.lockPeriod} days</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {opp.tokens.map((token) => (
                      <Badge key={token} variant="outline" className="text-xs">
                        {token}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-3xl font-bold text-green-600">{opp.apy.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground mt-1">APY</p>
                <Button variant="default" size="sm" className="mt-2">
                  <Zap className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Yield Strategies */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recommended Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.strategies.map((strategy) => (
            <div key={strategy.name} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold mb-1">{strategy.name}</h4>
                  <Badge className={getRiskColor(strategy.risk)}>{strategy.risk.toUpperCase()}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{strategy.expectedAPY.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Expected APY</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
              <div className="space-y-2 mb-3">
                <p className="text-xs font-semibold">Steps:</p>
                {strategy.steps.map((step, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    {i + 1}. {step}
                  </p>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Protocols: {strategy.protocols.join(', ')}
                </span>
                <span className="text-muted-foreground">Gas: ~${strategy.estimatedGas}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <div className="flex items-start gap-4">
          <TrendingUp className="h-8 w-8 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Yield Optimization Tips</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  Best opportunity: {filteredOpportunities[0]?.protocol} offering {filteredOpportunities[0]?.apy.toFixed(2)}% APY
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  {data.topOpportunities.filter(o => o.audited).length} audited protocols available for safer yields
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>
                  Always consider impermanent loss and smart contract risks when providing liquidity
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

