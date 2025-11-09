'use client';

import * as React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  DollarSign,
  Eye,
  Target,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface AnalyticsMetric {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export interface AnalyticsWidgetProps {
  title: string;
  description?: string;
  metrics: AnalyticsMetric[];
  className?: string;
}

export function AnalyticsWidget({
  title,
  description,
  metrics,
  className,
}: AnalyticsWidgetProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ metric }: { metric: AnalyticsMetric }) {
  const getTrendIcon = () => {
    if (metric.trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    if (metric.trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = () => {
    if (metric.trend === 'up') return 'text-green-500';
    if (metric.trend === 'down') return 'text-red-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="flex items-start justify-between p-4 rounded-lg border">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{metric.label}</p>
        <p className="text-2xl font-bold">{metric.value}</p>
        {metric.change !== undefined && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={cn('text-xs font-medium', getTrendColor())}>
              {metric.change > 0 ? '+' : ''}
              {metric.change}%
            </span>
            {metric.changeLabel && (
              <span className="text-xs text-muted-foreground">
                {metric.changeLabel}
              </span>
            )}
          </div>
        )}
      </div>
      {metric.icon && (
        <div className="rounded-full bg-primary/10 p-2">
          {metric.icon}
        </div>
      )}
    </div>
  );
}

// Preset: User analytics
export function UserAnalytics({
  totalUsers,
  activeUsers,
  newUsers,
  userGrowth,
  className,
}: {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  className?: string;
}) {
  const metrics: AnalyticsMetric[] = [
    {
      label: 'Total Users',
      value: totalUsers.toLocaleString(),
      icon: <Users className="h-5 w-5 text-primary" />,
    },
    {
      label: 'Active Users',
      value: activeUsers.toLocaleString(),
      change: userGrowth,
      changeLabel: 'vs last month',
      trend: userGrowth >= 0 ? 'up' : 'down',
      icon: <Activity className="h-5 w-5 text-primary" />,
    },
    {
      label: 'New Users',
      value: newUsers.toLocaleString(),
      icon: <Award className="h-5 w-5 text-primary" />,
    },
    {
      label: 'Activity Rate',
      value: `${Math.round((activeUsers / totalUsers) * 100)}%`,
      icon: <Target className="h-5 w-5 text-primary" />,
    },
  ];

  return (
    <AnalyticsWidget
      title="User Analytics"
      description="Overview of user engagement and growth"
      metrics={metrics}
      className={className}
    />
  );
}

// Preset: Airdrop analytics
export function AirdropAnalytics({
  totalAirdrops,
  activeAirdrops,
  eligibleWallets,
  avgScore,
  className,
}: {
  totalAirdrops: number;
  activeAirdrops: number;
  eligibleWallets: number;
  avgScore: number;
  className?: string;
}) {
  const metrics: AnalyticsMetric[] = [
    {
      label: 'Total Airdrops',
      value: totalAirdrops,
      icon: <DollarSign className="h-5 w-5 text-primary" />,
    },
    {
      label: 'Active Airdrops',
      value: activeAirdrops,
      icon: <Activity className="h-5 w-5 text-primary" />,
    },
    {
      label: 'Eligible Wallets',
      value: eligibleWallets.toLocaleString(),
      icon: <Users className="h-5 w-5 text-primary" />,
    },
    {
      label: 'Average Score',
      value: `${avgScore}/100`,
      icon: <Award className="h-5 w-5 text-primary" />,
    },
  ];

  return (
    <AnalyticsWidget
      title="Airdrop Analytics"
      description="Current airdrop statistics and trends"
      metrics={metrics}
      className={className}
    />
  );
}

// Simple metric card
export function SimpleMetricCard({
  label,
  value,
  icon,
  trend,
  change,
  className,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  change?: number;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <MetricCard
          metric={{
            label,
            value,
            icon,
            trend,
            change,
          }}
        />
      </CardContent>
    </Card>
  );
}

// Progress metric card
export function ProgressMetricCard({
  label,
  current,
  total,
  icon,
  className,
}: {
  label: string;
  current: number;
  total: number;
  icon?: React.ReactNode;
  className?: string;
}) {
  const percentage = Math.round((current / total) * 100);

  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">
              {current.toLocaleString()} / {total.toLocaleString()}
            </p>
          </div>
          {icon && (
            <div className="rounded-full bg-primary/10 p-2">
              {icon}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Progress value={percentage} />
          <p className="text-xs text-muted-foreground text-right">
            {percentage}% Complete
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Comparison metric card
export function ComparisonMetricCard({
  label,
  currentValue,
  previousValue,
  currentLabel = 'Current',
  previousLabel = 'Previous',
  icon,
  className,
}: {
  label: string;
  currentValue: number;
  previousValue: number;
  currentLabel?: string;
  previousLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  const change = ((currentValue - previousValue) / previousValue) * 100;
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{currentValue.toLocaleString()}</p>
          </div>
          {icon && (
            <div className="rounded-full bg-primary/10 p-2">
              {icon}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {previousLabel}: {previousValue.toLocaleString()}
          </span>
          <Badge variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}>
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

