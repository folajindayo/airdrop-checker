'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Input } from '@/components/ui/input';
import {
  Scale,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  DollarSign,
  Percent,
  AlertCircle,
  CheckCircle,
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

interface Asset {
  symbol: string;
  currentValue: number;
  currentAllocation: number;
  targetAllocation: number;
  difference: number;
  action: 'buy' | 'sell' | 'hold';
  amount: number;
  price: number;
}

interface RebalanceStrategy {
  name: string;
  description: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  assets: { symbol: string; allocation: number }[];
  expectedReturn: number;
  volatility: number;
}

interface RebalancerData {
  totalValue: number;
  currentAssets: Asset[];
  strategies: RebalanceStrategy[];
  rebalanceNeeded: boolean;
  estimatedCost: number;
  projectedGains: number;
}

interface PortfolioRebalancerProps {
  address: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function PortfolioRebalancer({ address }: PortfolioRebalancerProps) {
  const [data, setData] = useState<RebalancerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [customAllocations, setCustomAllocations] = useState<Record<string, number>>({});

  useEffect(() => {
    if (address) {
      fetchRebalancerData();
    }
  }, [address]);

  async function fetchRebalancerData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/portfolio-rebalancer/${address}`);
      const result = await response.json();
      setData(result);
      
      // Initialize custom allocations
      const allocations: Record<string, number> = {};
      result.currentAssets.forEach((asset: Asset) => {
        allocations[asset.symbol] = asset.targetAllocation;
      });
      setCustomAllocations(allocations);
    } catch (error) {
      console.error('Error fetching rebalancer data:', error);
      toast.error('Failed to load portfolio rebalancer');
    } finally {
      setLoading(false);
    }
  }

  function executeRebalance() {
    toast.success('Rebalancing portfolio... 🔄');
    // In production, this would execute the rebalancing trades
  }

  function applyStrategy(strategy: RebalanceStrategy) {
    const newAllocations: Record<string, number> = {};
    strategy.assets.forEach((asset) => {
      newAllocations[asset.symbol] = asset.allocation;
    });
    setCustomAllocations(newAllocations);
    setSelectedStrategy(strategy.name);
    toast.success(`Applied ${strategy.name} strategy`);
  }

  function getRiskColor(risk: string) {
    switch (risk) {
      case 'conservative':
        return 'text-green-600 bg-green-600/10';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-600/10';
      case 'aggressive':
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
        <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No rebalancer data available</p>
      </Card>
    );
  }

  const currentAllocationData = data.currentAssets.map((asset) => ({
    name: asset.symbol,
    value: asset.currentAllocation,
  }));

  const targetAllocationData = data.currentAssets.map((asset) => ({
    name: asset.symbol,
    value: customAllocations[asset.symbol] || asset.targetAllocation,
  }));

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={`p-6 ${data.rebalanceNeeded ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center ${data.rebalanceNeeded ? 'bg-yellow-600' : 'bg-green-600'}`}>
              <Scale className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">
                {data.rebalanceNeeded ? 'Rebalancing Recommended' : 'Portfolio Balanced'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Total Portfolio Value: ${data.totalValue.toLocaleString()}
              </p>
            </div>
          </div>
          {data.rebalanceNeeded && (
            <Button size="lg" onClick={executeRebalance}>
              <Zap className="h-5 w-5 mr-2" />
              Execute Rebalance
            </Button>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Estimated Cost</p>
            <DollarSign className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold">${data.estimatedCost.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Gas + slippage</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Projected Gains</p>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            ${data.projectedGains.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Annual estimate</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">ROI</p>
            <Percent className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {((data.projectedGains / data.totalValue) * 100).toFixed(2)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Expected return</p>
        </Card>
      </div>

      {/* Allocation Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Current Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={currentAllocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {currentAllocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Target Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={targetAllocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {targetAllocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Asset Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Rebalancing Actions</h3>
        <div className="space-y-3">
          {data.currentAssets.map((asset) => {
            const targetAlloc = customAllocations[asset.symbol] || asset.targetAllocation;
            const diff = targetAlloc - asset.currentAllocation;
            const action = diff > 0.5 ? 'buy' : diff < -0.5 ? 'sell' : 'hold';
            
            return (
              <div
                key={asset.symbol}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {asset.symbol.substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{asset.symbol}</h4>
                        {action === 'buy' && (
                          <Badge className="bg-green-600">BUY</Badge>
                        )}
                        {action === 'sell' && (
                          <Badge className="bg-red-600">SELL</Badge>
                        )}
                        {action === 'hold' && (
                          <Badge variant="outline">HOLD</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Current: {asset.currentAllocation.toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground">
                          Target: {targetAlloc.toFixed(1)}%
                        </span>
                        <span className={`font-semibold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold">${asset.currentValue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {action !== 'hold' && `${action === 'buy' ? '+' : '-'}$${Math.abs(asset.amount * asset.price).toFixed(2)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Target %:</label>
                  <Input
                    type="number"
                    value={customAllocations[asset.symbol] || asset.targetAllocation}
                    onChange={(e) => {
                      const newValue = Number(e.target.value);
                      if (newValue >= 0 && newValue <= 100) {
                        setCustomAllocations({
                          ...customAllocations,
                          [asset.symbol]: newValue,
                        });
                      }
                    }}
                    className="w-20 h-8 text-xs"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Preset Strategies */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Preset Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.strategies.map((strategy) => (
            <div
              key={strategy.name}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedStrategy === strategy.name ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
              }`}
              onClick={() => applyStrategy(strategy)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold mb-1">{strategy.name}</h4>
                  <Badge className={getRiskColor(strategy.riskLevel)}>
                    {strategy.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {strategy.expectedReturn.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Return</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
              <div className="space-y-1">
                {strategy.assets.map((asset) => (
                  <div key={asset.symbol} className="flex justify-between text-xs">
                    <span>{asset.symbol}</span>
                    <span className="font-semibold">{asset.allocation}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                Volatility: {strategy.volatility.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-blue-500/10 border-blue-500/20">
        <div className="flex items-start gap-4">
          <Target className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">About Portfolio Rebalancing</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Portfolio rebalancing helps maintain your target asset allocation and manage risk:
            </p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Maintains your desired risk/reward profile</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Takes profits from outperforming assets</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Buys undervalued assets at lower prices</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>Consider gas fees and tax implications before rebalancing</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

