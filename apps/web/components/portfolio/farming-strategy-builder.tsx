'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Target, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FarmingStrategyBuilderProps {
  address: string;
  currentScores: Record<string, number>;
  className?: string;
}

interface StrategyStep {
  id: string;
  title: string;
  description: string;
  protocol: string;
  chainId: number;
  chainName: string;
  estimatedGasUSD: number;
  priority: 'high' | 'medium' | 'low';
  impactScore: number;
  affectedAirdrops: string[];
  estimatedTime: string;
}

interface FarmingStrategy {
  address: string;
  currentScore: number;
  targetScore: number;
  estimatedTotalGas: number;
  estimatedTotalValue: number;
  steps: StrategyStep[];
  timeline: {
    week1: StrategyStep[];
    week2: StrategyStep[];
    week3: StrategyStep[];
    week4: StrategyStep[];
  };
  recommendations: string[];
  timestamp: number;
}

export function FarmingStrategyBuilder({ 
  address, 
  currentScores,
  className = '' 
}: FarmingStrategyBuilderProps) {
  const [data, setData] = useState<FarmingStrategy | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetScore, setTargetScore] = useState(80);

  useEffect(() => {
    if (!address || Object.keys(currentScores).length === 0) return;
    generateStrategy();
  }, [address, currentScores, targetScore]);

  async function generateStrategy() {
    if (!address || Object.keys(currentScores).length === 0) return;

    setLoading(true);
    
    try {
      const response = await fetch('/api/farming-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          currentScores,
          targetScore,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate strategy');
      }

      const strategyData = await response.json();
      setData(strategyData);
    } catch (err) {
      toast.error('Failed to generate farming strategy');
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Farming Strategy Builder</CardTitle>
          <CardDescription>Generate a personalized airdrop farming strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No strategy available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Farming Strategy Builder
        </CardTitle>
        <CardDescription>
          Personalized 4-week plan to maximize your airdrop eligibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Current Score</p>
            <p className="text-2xl font-bold mt-1">{data.currentScore.toFixed(0)}%</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Target Score</p>
            <p className="text-2xl font-bold mt-1">{data.targetScore}%</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Est. Gas Cost</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(data.estimatedTotalGas)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Est. Value</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(data.estimatedTotalValue)}</p>
          </div>
        </div>

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Strategy Recommendations
            </h4>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              {data.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timeline */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            4-Week Timeline
          </h3>
          <div className="space-y-4">
            {[
              { week: 'week1', label: 'Week 1', steps: data.timeline.week1 },
              { week: 'week2', label: 'Week 2', steps: data.timeline.week2 },
              { week: 'week3', label: 'Week 3', steps: data.timeline.week3 },
              { week: 'week4', label: 'Week 4', steps: data.timeline.week4 },
            ].map(({ week, label, steps }) => (
              <div key={week} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{label}</h4>
                  <Badge variant="secondary">
                    {steps.length} step{steps.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {steps.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No steps scheduled</p>
                  ) : (
                    steps.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-start justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{step.title}</span>
                            <Badge className={getPriorityColor(step.priority)}>
                              {step.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {step.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{step.protocol} • {step.chainName}</span>
                            <span>{step.estimatedTime}</span>
                            {step.affectedAirdrops.length > 0 && (
                              <span>
                                Affects: {step.affectedAirdrops.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="flex items-center gap-1 text-green-600 mb-1">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-semibold">+{step.impactScore}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(step.estimatedGasUSD)} gas
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={generateStrategy} variant="outline" className="w-full">
          Regenerate Strategy
        </Button>
      </CardContent>
    </Card>
  );
}

