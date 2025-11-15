'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  DollarSign,
  TrendingUp,
  Calculator,
  Sparkles,
  Info,
  ArrowRight,
  Zap,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AirdropEstimate {
  projectId: string;
  projectName: string;
  probability: number;
  estimatedTokens: number;
  estimatedValue: number;
  reasoning: string[];
  confidence: 'low' | 'medium' | 'high';
}

interface SimulationResult {
  totalEstimatedValue: number;
  bestCase: number;
  worstCase: number;
  averageCase: number;
  airdrops: AirdropEstimate[];
  recommendations: string[];
  potentialGains: { timeframe: string; value: number }[];
}

interface AirdropSimulatorProps {
  address: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const CONFIDENCE_COLORS = {
  low: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
  medium: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  high: 'text-green-600 bg-green-100 dark:bg-green-900/20',
};

export function AirdropSimulator({ address }: AirdropSimulatorProps) {
  const [data, setData] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityMultiplier, setActivityMultiplier] = useState(1);
  const [tokenPriceAssumption, setTokenPriceAssumption] = useState<'conservative' | 'moderate' | 'optimistic'>('moderate');

  useEffect(() => {
    if (address) {
      runSimulation();
    }
  }, [address, activityMultiplier, tokenPriceAssumption]);

  async function runSimulation() {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/airdrop-simulator/${address}?multiplier=${activityMultiplier}&pricing=${tokenPriceAssumption}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error running simulation:', error);
      toast.error('Failed to run simulation');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No simulation data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simulation Controls */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Simulation Parameters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Activity Multiplier: {activityMultiplier.toFixed(1)}x</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Simulate increased wallet activity
            </p>
            <Slider
              value={[activityMultiplier]}
              onValueChange={(value) => setActivityMultiplier(value[0])}
              min={0.5}
              max={3}
              step={0.1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.5x</span>
              <span>3x</span>
            </div>
          </div>
          <div>
            <Label>Token Price Assumption</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Expected token valuation scenario
            </p>
            <div className="flex gap-2 mt-2">
              {(['conservative', 'moderate', 'optimistic'] as const).map((option) => (
                <Button
                  key={option}
                  variant={tokenPriceAssumption === option ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTokenPriceAssumption(option)}
                  className="flex-1"
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Estimated Value Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 col-span-1 md:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Estimated Value</p>
              <h2 className="text-4xl font-bold">
                ${data.totalEstimatedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm">Based on {data.airdrops.length} potential airdrops</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Best Case</p>
            <Target className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            ${data.bestCase.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Worst Case</p>
            <Zap className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">
            ${data.worstCase.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </Card>
      </div>

      {/* Value Projections */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Potential Gains Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.potentialGains}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="timeframe" className="text-xs" />
            <YAxis className="text-xs" tickFormatter={(value) => `$${value.toLocaleString()}`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Estimated Value']}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Individual Airdrop Estimates */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Airdrop Breakdown</h3>
        <div className="space-y-4">
          {data.airdrops.map((airdrop, index) => (
            <div
              key={airdrop.projectId}
              className="p-4 bg-muted/50 rounded-lg border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg">{airdrop.projectName}</h4>
                    <Badge className={CONFIDENCE_COLORS[airdrop.confidence]}>
                      {airdrop.confidence.toUpperCase()} Confidence
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Probability: {airdrop.probability}%</span>
                    <span>•</span>
                    <span>Est. Tokens: {airdrop.estimatedTokens.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    ${airdrop.estimatedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Estimated Value</p>
                </div>
              </div>

              {/* Reasoning */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Why you might qualify:</p>
                <ul className="space-y-1">
                  {airdrop.reasoning.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Probability Bar */}
              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${airdrop.probability}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Value Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.airdrops.map((a) => ({
                  name: a.projectName,
                  value: a.estimatedValue,
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.airdrops.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Confidence Breakdown</h3>
          <div className="space-y-4">
            {['high', 'medium', 'low'].map((confidence) => {
              const count = data.airdrops.filter((a) => a.confidence === confidence).length;
              const percentage = (count / data.airdrops.length) * 100;
              return (
                <div key={confidence}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium capitalize">{confidence} Confidence</span>
                    <span className="text-muted-foreground">{count} airdrops</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        confidence === 'high'
                          ? 'bg-green-500'
                          : confidence === 'medium'
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Recommendations to Maximize Airdrops</h3>
          </div>
          <ul className="space-y-2">
            {data.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="p-6 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          <strong>Disclaimer:</strong> These estimates are based on historical airdrop data and your
          current wallet activity. Actual airdrop allocations may vary significantly. This simulation
          is for informational purposes only and should not be considered financial advice.
        </p>
      </Card>
    </div>
  );
}

