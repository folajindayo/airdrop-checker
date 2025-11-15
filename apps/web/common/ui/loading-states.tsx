'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-lg text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function CardLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <Card>
      <CardContent className="py-12">
        <LoadingSpinner size="lg" text={message} />
      </CardContent>
    </Card>
  );
}

export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

export function RefreshIndicator({ isRefreshing }: { isRefreshing: boolean }) {
  if (!isRefreshing) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <RefreshCw className="h-4 w-4 animate-spin" />
      <span>Refreshing data...</span>
    </div>
  );
}

export function DotPulse({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
    </div>
  );
}

export function SkeletonText({ className }: { className?: string }) {
  return <div className={cn('h-4 bg-muted rounded animate-pulse', className)} />;
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={cn('rounded-full bg-muted animate-pulse', sizeClasses[size])} />
  );
}

export function SkeletonCard() {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <SkeletonText className="w-1/3" />
          <SkeletonText className="w-full" />
          <SkeletonText className="w-2/3" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TableLoader({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonText key={colIndex} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ProgressBar({
  progress,
  showPercentage = true,
  className,
}: {
  progress: number;
  showPercentage?: boolean;
  className?: string;
}) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn('space-y-2', className)}>
      {showPercentage && (
        <div className="text-sm text-muted-foreground text-right">
          {clampedProgress}%
        </div>
      )}
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

export function StepIndicator({
  currentStep,
  totalSteps,
  className,
}: {
  currentStep: number;
  totalSteps: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'flex-1 h-1 rounded-full transition-colors',
            index < currentStep ? 'bg-primary' : 'bg-secondary'
          )}
        />
      ))}
    </div>
  );
}

export function ProcessingState({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg transition-colors',
              index === currentStep && 'bg-primary/10',
              index < currentStep && 'opacity-60'
            )}
          >
            {index < currentStep ? (
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : index === currentStep ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-muted" />
            )}
            <span
              className={cn(
                'text-sm',
                index === currentStep && 'font-medium',
                index > currentStep && 'text-muted-foreground'
              )}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

