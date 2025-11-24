'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
  Lock,
  Eye,
} from 'lucide-react';

interface HealthMetric {
  name: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
  icon: React.ReactNode;
}

interface WalletHealthData {
  address: string;
  totalTransactions: number;
  uniqueContracts: number;
  daysSinceFirstTx: number;
  highRiskInteractions: number;
  diversificationScore: number;
  activityConsistency: number;
}

interface WalletHealthScoreProps {
  data: WalletHealthData;
  className?: string;
}

/**
 * WalletHealthScore - Comprehensive wallet security and activity health analysis
 * Evaluates wallet based on multiple security and usage metrics
 */
export function WalletHealthScore({ data, className = '' }: WalletHealthScoreProps) {
  const metrics = useMemo<HealthMetric[]>(() => {
    const { 
      totalTransactions, 
      uniqueContracts, 
      daysSinceFirstTx,
      highRiskInteractions,
      diversificationScore,
      activityConsistency,
    } = data;

    // Calculate activity score (0-25)
    const activityScore = Math.min(25, Math.floor((totalTransactions / 100) * 25));
    const activityStatus = activityScore >= 20 ? 'excellent' : 
                           activityScore >= 15 ? 'good' : 
                           activityScore >= 10 ? 'warning' : 'critical';

    // Calculate experience score (0-20)
    const experienceScore = Math.min(20, Math.floor((daysSinceFirstTx / 365) * 20));
    const experienceStatus = experienceScore >= 15 ? 'excellent' :
                             experienceScore >= 10 ? 'good' :
                             experienceScore >= 5 ? 'warning' : 'critical';

    // Calculate security score (0-25)
    const securityScore = Math.max(0, 25 - (highRiskInteractions * 5));
    const securityStatus = securityScore >= 20 ? 'excellent' :
                           securityScore >= 15 ? 'good' :
                           securityScore >= 10 ? 'warning' : 'critical';

    // Diversification score (0-15)
    const diversScore = Math.min(15, diversificationScore);
    const diversStatus = diversScore >= 12 ? 'excellent' :
                         diversScore >= 8 ? 'good' :
                         diversScore >= 5 ? 'warning' : 'critical';

    // Consistency score (0-15)
    const consistencyScore = Math.min(15, activityConsistency);
    const consistencyStatus = consistencyScore >= 12 ? 'excellent' :
                              consistencyScore >= 8 ? 'good' :
                              consistencyScore >= 5 ? 'warning' : 'critical';

    return [
      {
        name: 'Activity Level',
        score: activityScore,
        maxScore: 25,
        status: activityStatus,
        description: `${totalTransactions} total transactions`,
        icon: <Activity className="w-5 h-5" />,
      },
      {
        name: 'Wallet Experience',
        score: experienceScore,
        maxScore: 20,
        status: experienceStatus,
        description: `Active for ${Math.floor(daysSinceFirstTx / 30)} months`,
        icon: <TrendingUp className="w-5 h-5" />,
      },
      {
        name: 'Security Rating',
        score: securityScore,
        maxScore: 25,
        status: securityStatus,
        description: highRiskInteractions === 0 
          ? 'No high-risk interactions detected'
          : `${highRiskInteractions} potential risks found`,
        icon: <Shield className="w-5 h-5" />,
      },
      {
        name: 'Portfolio Diversification',
        score: diversScore,
        maxScore: 15,
        status: diversStatus,
        description: `Interacted with ${uniqueContracts} unique contracts`,
        icon: <Eye className="w-5 h-5" />,
      },
      {
        name: 'Activity Consistency',
        score: consistencyScore,
        maxScore: 15,
        status: consistencyStatus,
        description: 'Regular transaction patterns',
        icon: <Lock className="w-5 h-5" />,
      },
    ];
  }, [data]);

  const overallScore = useMemo(() => {
    return metrics.reduce((sum, metric) => sum + metric.score, 0);
  }, [metrics]);

  const maxScore = useMemo(() => {
    return metrics.reduce((sum, metric) => sum + metric.maxScore, 0);
  }, [metrics]);

  const healthPercentage = Math.round((overallScore / maxScore) * 100);

  const getOverallStatus = (): {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
  } => {
    if (healthPercentage >= 80) {
      return {
        label: 'Excellent',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
        icon: <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />,
      };
    } else if (healthPercentage >= 60) {
      return {
        label: 'Good',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
        icon: <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      };
    } else if (healthPercentage >= 40) {
      return {
        label: 'Fair',
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
        icon: <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
      };
    } else {
      return {
        label: 'Needs Attention',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
        icon: <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />,
      };
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 dark:text-green-400';
      case 'good':
        return 'text-blue-600 dark:text-blue-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const status = getOverallStatus();

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Wallet Health Score
          </h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive security and activity analysis
          </p>
        </div>

        {/* Overall Score */}
        <div className={`border rounded-lg p-6 ${status.bgColor}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {status.icon}
              <div>
                <div className={`text-2xl font-bold ${status.color}`}>
                  {healthPercentage}%
                </div>
                <div className="text-sm font-medium">{status.label} Health</div>
              </div>
            </div>
            <Badge variant="outline" className={status.color}>
              {overallScore} / {maxScore} points
            </Badge>
          </div>
          <Progress value={healthPercentage} className="h-3" />
        </div>

        {/* Detailed Metrics */}
        <div className="space-y-4">
          <h4 className="font-medium">Health Breakdown</h4>
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="border rounded-lg p-4 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={getMetricStatusColor(metric.status)}>
                    {metric.icon}
                  </div>
                  <div>
                    <div className="font-medium">{metric.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {metric.description}
                    </div>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={getMetricStatusColor(metric.status)}
                >
                  {metric.score}/{metric.maxScore}
                </Badge>
              </div>
              <Progress
                value={(metric.score / metric.maxScore) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="bg-muted rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Improvement Recommendations
          </h4>
          <ul className="text-xs text-muted-foreground space-y-2">
            {healthPercentage < 80 && (
              <>
                {metrics.find(m => m.name === 'Activity Level')?.score! < 20 && (
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Increase wallet activity by interacting with more protocols
                    </span>
                  </li>
                )}
                {metrics.find(m => m.name === 'Portfolio Diversification')?.score! < 12 && (
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Diversify by exploring different DeFi protocols and dApps
                    </span>
                  </li>
                )}
                {metrics.find(m => m.name === 'Security Rating')?.score! < 20 && (
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0 text-yellow-500" />
                    <span>
                      Review and revoke suspicious token approvals immediately
                    </span>
                  </li>
                )}
                {metrics.find(m => m.name === 'Activity Consistency')?.score! < 12 && (
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Maintain regular wallet activity for better health score
                    </span>
                  </li>
                )}
              </>
            )}
            {healthPercentage >= 80 && (
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-500" />
                <span>
                  Great work! Your wallet shows excellent health and security practices
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
}

/**
 * CompactHealthWidget - Smaller version for dashboard
 */
export function CompactHealthWidget({
  score,
  className = '',
}: {
  score: number;
  className?: string;
}) {
  const status =
    score >= 80
      ? { label: 'Excellent', color: 'text-green-600 dark:text-green-400' }
      : score >= 60
      ? { label: 'Good', color: 'text-blue-600 dark:text-blue-400' }
      : score >= 40
      ? { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400' }
      : { label: 'Poor', color: 'text-red-600 dark:text-red-400' };

  return (
    <div
      className={`border rounded-lg p-4 space-y-3 hover:border-primary transition-colors ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Wallet Health
        </span>
        <Badge variant="outline" className={status.color}>
          {status.label}
        </Badge>
      </div>
      <div>
        <div className={`text-2xl font-bold ${status.color}`}>{score}%</div>
        <Progress value={score} className="h-2 mt-2" />
      </div>
    </div>
  );
}

