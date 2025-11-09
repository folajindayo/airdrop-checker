'use client';

import * as React from 'react';
import { Check, Circle, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  optional?: boolean;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'circles' | 'pills';
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  orientation = 'horizontal',
  variant = 'default',
  onStepClick,
  className,
}: StepperProps) {
  const isStepComplete = (index: number) => index < currentStep;
  const isStepCurrent = (index: number) => index === currentStep;
  const isStepClickable = (index: number) => index <= currentStep && onStepClick;

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex gap-4">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => isStepClickable(index) && onStepClick?.(index)}
                disabled={!isStepClickable(index)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  isStepComplete(index) &&
                    'border-primary bg-primary text-primary-foreground',
                  isStepCurrent(index) &&
                    'border-primary bg-background text-primary',
                  !isStepComplete(index) &&
                    !isStepCurrent(index) &&
                    'border-muted bg-background text-muted-foreground',
                  isStepClickable(index) && 'cursor-pointer hover:border-primary'
                )}
              >
                {isStepComplete(index) ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.icon || <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-full min-h-[40px] w-0.5',
                    isStepComplete(index) ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    'font-semibold',
                    isStepCurrent(index) && 'text-primary'
                  )}
                >
                  {step.label}
                </h3>
                {step.optional && (
                  <Badge variant="secondary" className="text-xs">
                    Optional
                  </Badge>
                )}
              </div>
              {step.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal orientation
  if (variant === 'circles') {
    return (
      <div className={cn('flex items-center justify-between', className)}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2 flex-1">
              <button
                onClick={() => isStepClickable(index) && onStepClick?.(index)}
                disabled={!isStepClickable(index)}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors',
                  isStepComplete(index) &&
                    'border-primary bg-primary text-primary-foreground',
                  isStepCurrent(index) &&
                    'border-primary bg-background text-primary ring-4 ring-primary/20',
                  !isStepComplete(index) &&
                    !isStepCurrent(index) &&
                    'border-muted bg-background text-muted-foreground',
                  isStepClickable(index) && 'cursor-pointer hover:border-primary'
                )}
              >
                {isStepComplete(index) ? (
                  <Check className="h-6 w-6" />
                ) : (
                  step.icon || <span className="font-semibold">{index + 1}</span>
                )}
              </button>
              <div className="text-center">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isStepCurrent(index) && 'text-primary'
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 mx-2',
                  isStepComplete(index) ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isStepClickable(index) && onStepClick?.(index)}
              disabled={!isStepClickable(index)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full transition-colors',
                isStepComplete(index) &&
                  'bg-primary text-primary-foreground',
                isStepCurrent(index) &&
                  'bg-primary/10 text-primary border-2 border-primary',
                !isStepComplete(index) &&
                  !isStepCurrent(index) &&
                  'bg-muted text-muted-foreground',
                isStepClickable(index) && 'cursor-pointer hover:bg-primary/20'
              )}
            >
              {isStepComplete(index) ? (
                <Check className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('flex items-start', className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center flex-1">
            <button
              onClick={() => isStepClickable(index) && onStepClick?.(index)}
              disabled={!isStepClickable(index)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                isStepComplete(index) &&
                  'border-primary bg-primary text-primary-foreground',
                isStepCurrent(index) &&
                  'border-primary bg-background text-primary',
                !isStepComplete(index) &&
                  !isStepCurrent(index) &&
                  'border-muted bg-background text-muted-foreground',
                isStepClickable(index) && 'cursor-pointer hover:border-primary'
              )}
            >
              {isStepComplete(index) ? (
                <Check className="h-5 w-5" />
              ) : (
                step.icon || <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </button>
            <div className="mt-2 text-center">
              <p
                className={cn(
                  'text-sm font-medium',
                  isStepCurrent(index) && 'text-primary'
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'h-0.5 flex-1 mt-5',
                isStepComplete(index) ? 'bg-primary' : 'bg-muted'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Stepper with content
export function StepperWithContent({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  className,
}: {
  steps: Array<Step & { content: React.ReactNode }>;
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete?: () => void;
  className?: string;
}) {
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className={cn('space-y-8', className)}>
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={onStepChange}
      />

      <Card>
        <CardContent className="p-6">
          {steps[currentStep].content}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button onClick={handleNext}>
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

// Compact stepper for small spaces
export function CompactStepper({
  steps,
  currentStep,
  className,
}: {
  steps: Step[];
  currentStep: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            'h-1.5 flex-1 rounded-full transition-colors',
            index <= currentStep ? 'bg-primary' : 'bg-muted'
          )}
        />
      ))}
    </div>
  );
}

// Numbered stepper with progress
export function NumberedStepper({
  steps,
  currentStep,
  className,
}: {
  steps: Step[];
  currentStep: number;
  className?: string;
}) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm font-medium">{steps[currentStep].label}</p>
    </div>
  );
}

