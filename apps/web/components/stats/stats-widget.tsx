import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatWidgetProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  description?: string;
  className?: string;
  iconClassName?: string;
}

export function StatWidget({
  title,
  value,
  icon,
  trend,
  description,
  className,
  iconClassName,
}: StatWidgetProps) {
  const getTrendIcon = (trendValue: number) => {
    if (trendValue > 0) return <TrendingUp className="h-4 w-4" />;
    if (trendValue < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = (trendValue: number) => {
    if (trendValue > 0) return 'text-green-600';
    if (trendValue < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div
            className={cn(
              'p-2 rounded-lg bg-primary/10 text-primary',
              iconClassName
            )}
          >
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium',
                getTrendColor(trend.value)
              )}
            >
              {getTrendIcon(trend.value)}
              <span>
                {Math.abs(trend.value)}%
                {trend.label && ` ${trend.label}`}
              </span>
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Grid of stat widgets
export function StatsGrid({
  stats,
  columns = 4,
  className,
}: {
  stats: StatWidgetProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <StatWidget key={index} {...stat} />
      ))}
    </div>
  );
}

// Compact stat display
export function CompactStat({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {icon && (
        <div className="p-2 rounded-lg bg-muted">{icon}</div>
      )}
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// Inline stat (minimal)
export function InlineStat({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

// Large featured stat
export function FeaturedStat({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
}) {
  const getTrendColor = (trendValue: number) => {
    if (trendValue > 0) return 'text-green-600';
    if (trendValue < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {icon && (
            <div className="p-3 rounded-xl bg-primary/10 text-primary">{icon}</div>
          )}
        </div>

        {/* Value */}
        <div className="space-y-1">
          <p className="text-4xl font-bold">{value}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Trend */}
        {trend && (
          <div className={cn('flex items-center gap-2', getTrendColor(trend.value))}>
            {trend.value > 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : trend.value < 0 ? (
              <TrendingDown className="h-5 w-5" />
            ) : (
              <Minus className="h-5 w-5" />
            )}
            <span className="font-medium">
              {trend.value > 0 ? '+' : ''}
              {trend.value}%
            </span>
            {trend.label && (
              <span className="text-muted-foreground text-sm">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Comparison stat
export function ComparisonStat({
  label,
  current,
  previous,
  className,
}: {
  label: string;
  current: number;
  previous: number;
  className?: string;
}) {
  const change = current - previous;
  const percentageChange = previous > 0 ? (change / previous) * 100 : 0;
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold">{current.toLocaleString()}</p>
          {change !== 0 && (
            <span
              className={cn(
                'text-sm font-medium',
                isPositive && 'text-green-600',
                isNegative && 'text-red-600'
              )}
            >
              {isPositive ? '+' : ''}
              {change.toLocaleString()} ({percentageChange.toFixed(1)}%)
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Previous: {previous.toLocaleString()}
        </p>
      </div>
    </Card>
  );
}

// Progress stat
export function ProgressStat({
  label,
  current,
  target,
  className,
}: {
  label: string;
  current: number;
  target: number;
  className?: string;
}) {
  const percentage = (current / target) * 100;
  const isComplete = current >= target;

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-sm font-bold">{Math.round(percentage)}%</p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300',
              isComplete ? 'bg-green-500' : 'bg-primary'
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{current.toLocaleString()} completed</span>
          <span>{target.toLocaleString()} target</span>
        </div>
      </div>
    </Card>
  );
}

