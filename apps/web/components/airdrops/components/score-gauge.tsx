'use client';

import { Progress } from '@/components/ui/progress';
import { getScoreLevel, getScoreLevelLabel } from '@airdrop-finder/shared';
import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  className?: string;
}

export function ScoreGauge({ score, className }: ScoreGaugeProps) {
  const level = getScoreLevel(score);
  const label = getScoreLevelLabel(score);

  const colorClasses = {
    high: 'text-green-600 dark:text-green-400',
    moderate: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-red-600 dark:text-red-400',
  };

  const progressColors = {
    high: '[&>div]:bg-green-600',
    moderate: '[&>div]:bg-yellow-600',
    low: '[&>div]:bg-red-600',
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Overall Airdrop Readiness
          </h3>
          <p className={cn('text-4xl font-bold', colorClasses[level])}>
            {score}
            <span className="text-2xl text-muted-foreground">/100</span>
          </p>
        </div>
        <div className="text-right">
          <p className={cn('text-lg font-semibold', colorClasses[level])}>
            {label}
          </p>
        </div>
      </div>

      <Progress
        value={score}
        className={cn('h-3', progressColors[level])}
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  );
}

