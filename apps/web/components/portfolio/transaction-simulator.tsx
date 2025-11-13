'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Zap, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TransactionSimulatorProps {
  address: string;
  currentScores: Record<string, number>;
  className?: string;
}

interface SimulatedTransaction {
  type: 'swap' | 'bridge' | 'mint' | 'stake' | 'transfer';
  protocol: string;
  chainId: number;
  chainName: string;
  estimatedGasUSD: number;
  impactScore: number;
  affectedAirdrops: Array<{
    projectId: string;
    projectName: string;
    scoreChange: number;
    newScore: number;
  }>;
}

interface SimulationData {
  address: string;
  currentScores: Record<string, number>;
  simulations: SimulatedTransaction[];
  recommendations: string[];
  timestamp: number;
}

export function TransactionSimulator({ 
  address, 
  currentScores,
  className = '' 
}: TransactionSimulatorProps) {
  const [data, setData] = useState<SimulationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || Object.keys(currentScores).length === 0) return;
    simulateTransactions();
  }, [address, currentScores]);

  async function simulateTransactions() {
    if (!address || Object.keys(currentScores).length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/transaction-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          currentScores,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to simulate transactions');
      }

      const simulationData = await response.json();
      setData(simulationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Failed to simulate transactions');
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
          <CardTitle>Transaction Simulator</CardTitle>
          <CardDescription>Error loading simulation data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
          <Button onClick={simulateTransactions} className="mt-4" size="sm">
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'swap':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'bridge':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'mint':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'stake':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Transaction Simulator
        </CardTitle>
        <CardDescription>
          Simulate transactions to see their impact on airdrop eligibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
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
        )}

        {/* Top Simulations */}
        <div>
          <h3 className="font-semibold mb-3">Top Impact Transactions</h3>
          <div className="space-y-3">
            {data.simulations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No simulations available
              </p>
            ) : (
              data.simulations.slice(0, 10).map((sim, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(sim.type)}>
                        {sim.type.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{sim.protocol}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{sim.chainName}</span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-semibold">+{sim.impactScore.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        ~{formatCurrency(sim.estimatedGasUSD)} gas
                      </p>
                    </div>
                  </div>
                  
                  {sim.affectedAirdrops.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground mb-1">Affected Airdrops:</p>
                      {sim.affectedAirdrops.slice(0, 3).map((airdrop) => (
                        <div
                          key={airdrop.projectId}
                          className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1"
                        >
                          <span>{airdrop.projectName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {currentScores[airdrop.projectId]?.toFixed(0) || 0}%
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold text-green-600">
                              {airdrop.newScore.toFixed(0)}%
                            </span>
                            <Badge variant="secondary" className="ml-1">
                              +{airdrop.scoreChange.toFixed(1)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {sim.affectedAirdrops.length > 3 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          +{sim.affectedAirdrops.length - 3} more
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <Button onClick={simulateTransactions} variant="outline" className="w-full">
          Refresh Simulations
        </Button>
      </CardContent>
    </Card>
  );
}



