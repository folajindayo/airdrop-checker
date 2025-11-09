'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Activity, AlertTriangle, CheckCircle2, TrendingUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface WalletHealthDashboardProps {
  address: string;
  className?: string;
}

interface HealthMetric {
  category: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  details: string[];
}

interface WalletHealthData {
  address: string;
  overallScore: number;
  metrics: HealthMetric[];
  riskFactors: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendations: string[];
  timestamp: number;
}

export function WalletHealthDashboard({ address, className = '' }: WalletHealthDashboardProps) {
  const [data, setData] = useState<WalletHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    async function fetchHealth() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/wallet-health/${address}`);
        if (!response.ok) {
          throw new Error('Failed to fetch wallet health');
        }
        
        const healthData = await response.json();
        setData(healthData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
  }, [address]);

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
          <CardTitle>Wallet Health Dashboard</CardTitle>
          <CardDescription>Error loading health data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const overallPercentage = (data.overallScore / 100) * 100;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Wallet Health Dashboard
        </CardTitle>
        <CardDescription>Comprehensive health analysis of your wallet</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="bg-muted/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Overall Health Score</p>
              <p className="text-4xl font-bold mt-1">{data.overallScore}/100</p>
            </div>
            <div className={cn(
              "h-16 w-16 rounded-full flex items-center justify-center",
              overallPercentage >= 80 ? "bg-green-100 dark:bg-green-900" :
              overallPercentage >= 60 ? "bg-blue-100 dark:bg-blue-900" :
              overallPercentage >= 40 ? "bg-yellow-100 dark:bg-yellow-900" :
              "bg-red-100 dark:bg-red-900"
            )}>
              {overallPercentage >= 80 ? (
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : overallPercentage >= 60 ? (
                <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              )}
            </div>
          </div>
          <Progress value={overallPercentage} className="h-2" />
        </div>

        {/* Metrics */}
        <div>
          <h3 className="font-semibold mb-4">Health Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.metrics.map((metric) => {
              const percentage = (metric.score / metric.maxScore) * 100;
              return (
                <div key={metric.category} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{metric.category}</span>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-semibold">
                        {metric.score}/{metric.maxScore}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                    <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                      {metric.details.map((detail, index) => (
                        <li key={index}>• {detail}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Factors */}
        {data.riskFactors.length > 0 && (
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Factors
            </h3>
            <div className="space-y-2">
              {data.riskFactors.map((risk, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{risk.type}</span>
                      <Badge className={getSeverityColor(risk.severity)}>
                        {risk.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{risk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
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
      </CardContent>
    </Card>
  );
}

