'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, TrendingDown, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface GasPrice {
  speed: 'slow' | 'standard' | 'fast' | 'instant';
  gwei: number;
  usd: number;
  time: string; // estimated time
}

interface GasPrediction {
  hour: number;
  gwei: number;
  label: string;
  recommendation: 'best' | 'good' | 'average' | 'avoid';
}

interface GasOptimizerProps {
  chainId?: number;
  className?: string;
}

/**
 * GasFeeOptimizer - Real-time gas price monitoring and optimization suggestions
 * Helps users save on transaction fees by suggesting optimal transaction times
 */
export function GasFeeOptimizer({ chainId = 1, className = '' }: GasOptimizerProps) {
  const [currentGas, setCurrentGas] = useState<GasPrice[]>([
    { speed: 'slow', gwei: 12, usd: 2.5, time: '~5 min' },
    { speed: 'standard', gwei: 15, usd: 3.1, time: '~2 min' },
    { speed: 'fast', gwei: 18, usd: 3.8, time: '~30 sec' },
    { speed: 'instant', gwei: 22, usd: 4.6, time: '~15 sec' },
  ]);

  const [predictions, setPredictions] = useState<GasPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Generate predictions for next 24 hours
  useEffect(() => {
    const generatePredictions = () => {
      const now = new Date();
      const preds: GasPrediction[] = [];

      for (let i = 0; i < 24; i++) {
        const hour = (now.getHours() + i) % 24;
        // Simulate gas price patterns (higher during US/EU business hours)
        let baseGwei = 15;
        if (hour >= 14 && hour <= 22) {
          baseGwei = 25; // Peak hours (US afternoon/evening)
        } else if (hour >= 8 && hour <= 13) {
          baseGwei = 20; // EU business hours
        } else if (hour >= 2 && hour <= 7) {
          baseGwei = 12; // Low activity
        }

        // Add some variance
        const variance = Math.random() * 4 - 2;
        const gwei = Math.max(10, baseGwei + variance);

        let recommendation: 'best' | 'good' | 'average' | 'avoid';
        if (gwei < 15) recommendation = 'best';
        else if (gwei < 20) recommendation = 'good';
        else if (gwei < 25) recommendation = 'average';
        else recommendation = 'avoid';

        preds.push({
          hour,
          gwei: Math.round(gwei * 10) / 10,
          label: `${hour.toString().padStart(2, '0')}:00`,
          recommendation,
        });
      }

      setPredictions(preds);
    };

    generatePredictions();
  }, []);

  const refreshGasPrices = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCurrentGas(prev =>
        prev.map(gas => ({
          ...gas,
          gwei: Math.max(10, gas.gwei + (Math.random() * 4 - 2)),
          usd: Math.max(2, gas.usd + (Math.random() * 0.5 - 0.25)),
        }))
      );
      setLastUpdate(new Date());
      setIsLoading(false);
    }, 500);
  };

  const getBestTime = () => {
    const sorted = [...predictions].sort((a, b) => a.gwei - b.gwei);
    return sorted[0];
  };

  const getSavings = () => {
    const currentStandard = currentGas.find(g => g.speed === 'standard');
    const bestTime = getBestTime();
    if (!currentStandard) return 0;
    return Math.round(((currentStandard.gwei - bestTime.gwei) / currentStandard.gwei) * 100);
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'slow':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'standard':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'fast':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'instant':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'best':
        return 'text-green-600 dark:text-green-400';
      case 'good':
        return 'text-blue-600 dark:text-blue-400';
      case 'average':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'avoid':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const bestTime = getBestTime();
  const savings = getSavings();

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Gas Fee Optimizer
            </h3>
            <p className="text-sm text-muted-foreground">
              Save on transaction fees with optimal timing
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshGasPrices}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Current Gas Prices */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Current Gas Prices</h4>
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {currentGas.map((gas) => (
              <div
                key={gas.speed}
                className="border rounded-lg p-3 space-y-2 hover:border-primary transition-colors"
              >
                <Badge className={getSpeedColor(gas.speed)} variant="secondary">
                  {gas.speed}
                </Badge>
                <div>
                  <div className="text-2xl font-bold">{gas.gwei.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Gwei</div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">${gas.usd.toFixed(2)}</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {gas.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimization Insight */}
        {savings > 0 && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  Save up to {savings}% on gas fees
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Best time to transact: <strong>{bestTime.label}</strong> (
                  {bestTime.gwei} Gwei)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 24-Hour Prediction Chart */}
        <div>
          <h4 className="font-medium mb-3">24-Hour Gas Price Forecast</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="label"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  interval={3}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  label={{ value: 'Gwei', angle: -90, position: 'insideLeft' }}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as GasPrediction;
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <div className="font-semibold">{data.label}</div>
                          <div className="text-sm">{data.gwei} Gwei</div>
                          <Badge
                            className={getRecommendationColor(data.recommendation)}
                            variant="secondary"
                          >
                            {data.recommendation}
                          </Badge>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="gwei"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Times to Transact */}
        <div>
          <h4 className="font-medium mb-3">Recommended Transaction Times</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {predictions
              .filter(p => p.recommendation === 'best' || p.recommendation === 'good')
              .slice(0, 4)
              .map((pred) => (
                <div
                  key={pred.hour}
                  className={`border rounded-lg p-3 text-center ${getRecommendationColor(
                    pred.recommendation
                  )}`}
                >
                  <div className="text-lg font-bold">{pred.label}</div>
                  <div className="text-sm">{pred.gwei} Gwei</div>
                  <Badge variant="outline" className="mt-1">
                    {pred.recommendation}
                  </Badge>
                </div>
              ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">💡 Gas Optimization Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Gas prices are typically lowest on weekends and early mornings (UTC)</li>
            <li>• Avoid transacting during US/EU business hours for best rates</li>
            <li>• Use &quot;slow&quot; speed for non-urgent transactions to save 40-60%</li>
            <li>• Batch multiple transactions when possible to save on gas</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

/**
 * CompactGasWidget - Smaller version for dashboard cards
 */
export function CompactGasWidget({ className = '' }: { className?: string }) {
  const [currentGas, setCurrentGas] = useState(15.3);
  const [trend, setTrend] = useState<'up' | 'down'>('down');

  return (
    <div
      className={`border rounded-lg p-4 space-y-2 hover:border-primary transition-colors ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          Gas Price
        </span>
        {trend === 'down' ? (
          <TrendingDown className="w-4 h-4 text-green-500" />
        ) : (
          <TrendingUp className="w-4 h-4 text-red-500" />
        )}
      </div>
      <div>
        <div className="text-2xl font-bold">{currentGas.toFixed(1)}</div>
        <div className="text-xs text-muted-foreground">Gwei</div>
      </div>
      <Badge
        variant="secondary"
        className={
          currentGas < 15
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : currentGas < 25
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
        }
      >
        {currentGas < 15 ? 'Low' : currentGas < 25 ? 'Medium' : 'High'}
      </Badge>
    </div>
  );
}

