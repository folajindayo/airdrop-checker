'use client';

import { Check, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'completed' | 'error';
}

interface ProgressTrackerProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function ProgressTracker({
  steps,
  orientation = 'horizontal',
  className,
}: ProgressTrackerProps) {
  if (orientation === 'vertical') {
    return <VerticalProgressTracker steps={steps} className={className} />;
  }

  return <HorizontalProgressTracker steps={steps} className={className} />;
}

function HorizontalProgressTracker({
  steps,
  className,
}: {
  steps: Step[];
  className?: string;
}) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step */}
              <div className="flex flex-col items-center">
                {/* Icon */}
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                    step.status === 'completed' &&
                      'bg-green-500 border-green-500 text-white',
                    step.status === 'current' &&
                      'bg-primary border-primary text-primary-foreground',
                    step.status === 'error' &&
                      'bg-red-500 border-red-500 text-white',
                    step.status === 'pending' && 'bg-background border-muted'
                  )}
                >
                  {step.status === 'completed' && <Check className="h-5 w-5" />}
                  {step.status === 'current' && (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}
                  {step.status === 'error' && (
                    <span className="text-lg font-bold">!</span>
                  )}
                  {step.status === 'pending' && (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center max-w-[120px]">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      step.status === 'current' && 'text-primary',
                      step.status === 'completed' && 'text-green-600',
                      step.status === 'error' && 'text-red-600',
                      step.status === 'pending' && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-colors',
                    step.status === 'completed' ? 'bg-green-500' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VerticalProgressTracker({
  steps,
  className,
}: {
  steps: Step[];
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="relative">
            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  'absolute left-5 top-10 w-0.5 h-full transition-colors',
                  step.status === 'completed' ? 'bg-green-500' : 'bg-muted'
                )}
              />
            )}

            {/* Step */}
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors flex-shrink-0 relative z-10',
                  step.status === 'completed' &&
                    'bg-green-500 border-green-500 text-white',
                  step.status === 'current' &&
                    'bg-primary border-primary text-primary-foreground',
                  step.status === 'error' &&
                    'bg-red-500 border-red-500 text-white',
                  step.status === 'pending' && 'bg-background border-muted'
                )}
              >
                {step.status === 'completed' && <Check className="h-5 w-5" />}
                {step.status === 'current' && (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
                {step.status === 'error' && (
                  <span className="text-lg font-bold">!</span>
                )}
                {step.status === 'pending' && (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <p
                  className={cn(
                    'font-medium',
                    step.status === 'current' && 'text-primary',
                    step.status === 'completed' && 'text-green-600',
                    step.status === 'error' && 'text-red-600',
                    step.status === 'pending' && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Simple numbered progress
export function NumberedProgress({
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
      <div className="flex items-center gap-1">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              index < currentStep ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  );
}

// Minimal progress bar
export function MinimalProgressBar({
  steps,
  className,
}: {
  steps: Step[];
  className?: string;
}) {
  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {completedCount} of {steps.length} completed
        </span>
      </div>
    </div>
  );
}

// Circular progress
export function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  className,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-300"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

