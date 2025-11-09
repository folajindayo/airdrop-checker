'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/common/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ROICalculatorProps {
  address: string;
  airdrops: Array<{
    projectId: string;
    project: string;
    score: number;
  }>;
  gasSpentUSD?: number;
  className?: string;
}

interface ROICalculation {
  address: string;
  totalGasSpent: number;
  estimatedAirdropValue: number;
  potentialROI: number;
  roiPercentage: number;
  breakEvenAirdropValue: number;
  airdropBreakdown: Array<{
    projectId: string;
    projectName: string;
    score: number;
    estimatedValue: number;
    probability: number;
    expectedValue: number;
  }>;
  recommendations: string[];
  timestamp: number;
}

export function ROICalculator({ 
  address, 
  airdrops, 
  gasSpentUSD = 0,
  className = '' 
}: ROICalculatorProps) {
  const [data, setData] = useState<ROICalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || airdrops.length === 0) return;
    calculateROI();
  }, [address, airdrops, gasSpentUSD]);

  async function calculateROI() {
    if (!address || airdrops.length === 0) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/roi-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          airdrops,
          gasSpentUSD,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate ROI');
      }
      
      const roiData = await response.json();
      setData(roiData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Failed to calculate ROI');
    } finally {
      setLoading(false);
    }
  }

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

  if (error || !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>ROI Calculator</CardTitle>
          <CardDescription>Error calculating ROI</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
          <Button onClick={calculateROI} className="mt-4" size="sm">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const roiColor = data.roiPercentage >= 0 ? 'text-green-600' : 'text-red-600';
  const roiIcon = data.roiPercentage >= 0 ? TrendingUp : TrendingDown;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          ROI Calculator
        </CardTitle>
        <CardDescription>Calculate potential return on airdrop investment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Gas Spent</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(data.totalGasSpent)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Estimated Value</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(data.estimatedAirdropValue)}</p>
          </div>
          <div className={cn("bg-muted/50 rounded-lg p-4", roiColor)}>
            <p className="text-sm text-muted-foreground">Potential ROI</p>
            <div className="flex items-center gap-2 mt-1">
              {roiIcon === TrendingUp ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              <p className="text-2xl font-bold">{formatCurrency(data.potentialROI)}</p>
            </div>
            <p className="text-sm mt-1">{data.roiPercentage.toFixed(1)}%</p>
          </div>
        </div>

        {/* ROI Percentage Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">ROI Percentage</span>
            <span className={cn("text-sm font-semibold", roiColor)}>
              {data.roiPercentage >= 0 ? '+' : ''}{data.roiPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={cn(
                "h-3 rounded-full transition-all",
                data.roiPercentage >= 0 ? "bg-green-600" : "bg-red-600"
              )}
              style={{ 
                width: `${Math.min(Math.abs(data.roiPercentage), 100)}%` 
              }}
            />
          </div>
        </div>

        {/* Top Airdrops */}
        <div>
          <h3 className="font-semibold mb-3">Top Airdrop Opportunities</h3>
          <div className="space-y-2">
            {data.airdropBreakdown
              .sort((a, b) => b.expectedValue - a.expectedValue)
              .slice(0, 5)
              .map((airdrop) => (
                <div
                  key={airdrop.projectId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{airdrop.projectName}</span>
                      <Badge variant={airdrop.score >= 60 ? "default" : "secondary"}>
                        {airdrop.score}% score
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(airdrop.probability * 100).toFixed(0)}% probability
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(airdrop.expectedValue)}</p>
                    <p className="text-xs text-muted-foreground">
                      Est: {formatCurrency(airdrop.estimatedValue)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Recommendations
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
            </div>
          </div>
        )}

        {/* Break Even Info */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <p className="text-muted-foreground">
            <strong>Break-even point:</strong> You need airdrops worth{' '}
            <strong>{formatCurrency(data.breakEvenAirdropValue)}</strong> to cover your gas costs.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

