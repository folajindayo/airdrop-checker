'use client';

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  TrendingUp,
  DollarSign,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  gasPrice: number;
  gasUsed: number;
  timestamp: number;
  protocol?: string;
  type: 'swap' | 'transfer' | 'mint' | 'bridge' | 'stake' | 'other';
}

interface BatchOpportunity {
  transactions: Transaction[];
  potentialSavings: number;
  savingsPercentage: number;
  estimatedGas: number;
  recommendation: string;
}

interface TxBatchAnalyzerProps {
  transactions: Transaction[];
  className?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

/**
 * TransactionBatchAnalyzer - Analyze transactions and suggest batching opportunities
 * Helps users save gas fees by batching similar transactions
 */
export function TransactionBatchAnalyzer({
  transactions,
  className = '',
}: TxBatchAnalyzerProps) {
  const [selectedOpportunity, setSelectedOpportunity] = useState<BatchOpportunity | null>(null);

  // Analyze transaction patterns
  const analysis = useMemo(() => {
    // Group by type
    const byType = transactions.reduce((acc, tx) => {
      acc[tx.type] = (acc[tx.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by protocol
    const byProtocol = transactions.reduce((acc, tx) => {
      if (tx.protocol) {
        acc[tx.protocol] = (acc[tx.protocol] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Calculate total gas spent
    const totalGasSpent = transactions.reduce(
      (sum, tx) => sum + tx.gasPrice * tx.gasUsed,
      0
    );

    // Group by day for time series
    const byDay = transactions.reduce((acc, tx) => {
      const date = new Date(tx.timestamp).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
      byProtocol: Object.entries(byProtocol)
        .map(([protocol, count]) => ({ protocol, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      totalGasSpent,
      byDay: Object.entries(byDay).map(([date, count]) => ({ date, count })),
    };
  }, [transactions]);

  // Identify batching opportunities
  const batchOpportunities = useMemo((): BatchOpportunity[] => {
    const opportunities: BatchOpportunity[] = [];

    // Group transactions by protocol and type within time windows
    const timeWindows = new Map<string, Transaction[]>();

    transactions.forEach((tx) => {
      const hour = Math.floor(tx.timestamp / (3600 * 1000));
      const key = `${tx.protocol || 'unknown'}_${tx.type}_${hour}`;

      if (!timeWindows.has(key)) {
        timeWindows.set(key, []);
      }
      timeWindows.get(key)!.push(tx);
    });

    // Find windows with multiple transactions that could be batched
    timeWindows.forEach((txs, key) => {
      if (txs.length >= 2) {
        const totalGas = txs.reduce((sum, tx) => sum + tx.gasPrice * tx.gasUsed, 0);
        // Batching typically saves 30-60% on gas
        const potentialSavings = totalGas * 0.45;
        const batchGas = totalGas * 0.55;

        opportunities.push({
          transactions: txs,
          potentialSavings,
          savingsPercentage: 45,
          estimatedGas: batchGas,
          recommendation: `Batch ${txs.length} ${txs[0].type} transactions on ${
            txs[0].protocol || 'same protocol'
          }`,
        });
      }
    });

    return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }, [transactions]);

  const totalPotentialSavings = useMemo(() => {
    return batchOpportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0);
  }, [batchOpportunities]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'swap':
        return <ArrowRight className="w-4 h-4" />;
      case 'transfer':
        return <Package className="w-4 h-4" />;
      case 'stake':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Transaction Batch Analyzer
          </h3>
          <p className="text-sm text-muted-foreground">
            Optimize gas fees by identifying batching opportunities
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-2xl font-bold">{transactions.length}</div>
            <div className="text-xs text-muted-foreground">Total Transactions</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${(analysis.totalGasSpent / 1e9).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Gas Spent</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${(totalPotentialSavings / 1e9).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Potential Savings</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-2xl font-bold">{batchOpportunities.length}</div>
            <div className="text-xs text-muted-foreground">Batch Opportunities</div>
          </div>
        </div>

        {/* Savings Opportunity Banner */}
        {totalPotentialSavings > 0 && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  You could have saved ${(totalPotentialSavings / 1e9).toFixed(2)} on gas!
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  We found {batchOpportunities.length} opportunities where batching similar
                  transactions could reduce your gas costs significantly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Type Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Transactions by Type</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analysis.byType}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {analysis.byType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Top Protocols</h4>
            <div className="space-y-2">
              {analysis.byProtocol.slice(0, 5).map((item, index) => (
                <div key={item.protocol} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{item.protocol}</span>
                  </div>
                  <Badge variant="secondary">{item.count} txs</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Batching Opportunities */}
        {batchOpportunities.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              Batching Opportunities
            </h4>
            <div className="space-y-2">
              {batchOpportunities.slice(0, 5).map((opp, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                  onClick={() => setSelectedOpportunity(opp)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(opp.transactions[0].type)}
                      <span className="font-medium">{opp.recommendation}</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    >
                      Save {opp.savingsPercentage}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      <span>{opp.transactions.length} transactions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Save ${(opp.potentialSavings / 1e9).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Timeline */}
        <div>
          <h4 className="font-medium mb-3">Transaction Activity</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.byDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                <RechartsTooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Optimization Tips */}
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Gas Optimization Tips
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-500" />
              <span>
                Batch similar transactions within the same hour to save 40-60% on gas
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-500" />
              <span>Use multicall contracts when interacting with the same protocol</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-500" />
              <span>Execute transactions during low-activity periods (weekends, early UTC mornings)</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-yellow-500" />
              <span>Avoid making many small transactions - plan ahead and batch when possible</span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

