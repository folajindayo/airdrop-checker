'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  isValid?: () => boolean | Promise<boolean>;
}

export interface MultiStepFormProps {
  steps: Step[];
  onComplete: () => void | Promise<void>;
  onStepChange?: (stepIndex: number) => void;
  className?: string;
  showProgress?: boolean;
  allowSkip?: boolean;
}

export function MultiStepForm({
  steps,
  onComplete,
  onStepChange,
  className,
  showProgress = true,
  allowSkip = false,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [isValidating, setIsValidating] = React.useState(false);

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = async () => {
    const step = steps[currentStep];
    
    if (step.isValid) {
      setIsValidating(true);
      try {
        const isValid = await step.isValid();
        if (!isValid) {
          setIsValidating(false);
          return;
        }
      } catch (error) {
        console.error('Validation error:', error);
        setIsValidating(false);
        return;
      }
      setIsValidating(false);
    }

    setCompletedSteps((prev) => new Set(prev).add(currentStep));

    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
    } else {
      await onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (allowSkip || completedSteps.has(stepIndex - 1) || stepIndex < currentStep) {
      setCurrentStep(stepIndex);
      onStepChange?.(stepIndex);
    }
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Progress bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => handleStepClick(index)}
              disabled={!allowSkip && !completedSteps.has(index - 1) && index > currentStep}
              className={cn(
                'flex flex-col items-center gap-2 transition-opacity',
                index === currentStep && 'opacity-100',
                index !== currentStep && 'opacity-50 hover:opacity-75',
                (!allowSkip && !completedSteps.has(index - 1) && index > currentStep) && 'cursor-not-allowed opacity-25'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  index === currentStep && 'border-primary bg-primary text-primary-foreground',
                  index < currentStep && 'border-primary bg-primary text-primary-foreground',
                  index > currentStep && 'border-muted bg-background'
                )}
              >
                {completedSteps.has(index) || index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <div className="hidden sm:block text-center">
                <p className="text-xs font-medium">{step.title}</p>
              </div>
            </button>
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 mx-2 transition-colors',
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          {steps[currentStep].description && (
            <CardDescription>{steps[currentStep].description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>{steps[currentStep].content}</CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={handleNext} disabled={isValidating}>
          {isValidating ? (
            'Validating...'
          ) : currentStep === totalSteps - 1 ? (
            'Complete'
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Compact multi-step form (no card wrapper)
export function CompactMultiStepForm({
  steps,
  onComplete,
  currentStep = 0,
  onStepChange,
  className,
}: {
  steps: Step[];
  onComplete: () => void;
  currentStep?: number;
  onStepChange?: (stepIndex: number) => void;
  className?: string;
}) {
  const [activeStep, setActiveStep] = React.useState(currentStep);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      onStepChange?.(nextStep);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      const prevStep = activeStep - 1;
      setActiveStep(prevStep);
      onStepChange?.(prevStep);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Compact step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              index <= activeStep ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{steps[activeStep].title}</h3>
          {steps[activeStep].description && (
            <p className="text-sm text-muted-foreground mt-1">
              {steps[activeStep].description}
            </p>
          )}
        </div>
        <div>{steps[activeStep].content}</div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={activeStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext}>
          {activeStep === steps.length - 1 ? 'Finish' : 'Continue'}
          {activeStep < steps.length - 1 && (
            <ChevronRight className="h-4 w-4 ml-2" />
          )}
        </Button>
      </div>
    </div>
  );
}

// Vertical step form
export function VerticalStepForm({
  steps,
  currentStep = 0,
  onStepChange,
  className,
}: {
  steps: Step[];
  currentStep?: number;
  onStepChange?: (stepIndex: number) => void;
  className?: string;
}) {
  const [activeStep, setActiveStep] = React.useState(currentStep);

  const handleStepClick = (index: number) => {
    if (index <= activeStep) {
      setActiveStep(index);
      onStepChange?.(index);
    }
  };

  return (
    <div className={cn('flex gap-6', className)}>
      {/* Vertical steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => handleStepClick(index)}
            disabled={index > activeStep}
            className={cn(
              'flex items-start gap-3 text-left transition-opacity',
              index === activeStep && 'opacity-100',
              index !== activeStep && 'opacity-50 hover:opacity-75',
              index > activeStep && 'cursor-not-allowed opacity-25'
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                index === activeStep && 'border-primary bg-primary text-primary-foreground',
                index < activeStep && 'border-primary bg-primary text-primary-foreground',
                index > activeStep && 'border-muted'
              )}
            >
              {index < activeStep ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-xs font-semibold">{index + 1}</span>
              )}
            </div>
            <div>
              <p className="font-medium">{step.title}</p>
              {step.description && (
                <p className="text-xs text-muted-foreground">{step.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>{steps[activeStep].title}</CardTitle>
          </CardHeader>
          <CardContent>{steps[activeStep].content}</CardContent>
        </Card>
      </div>
    </div>
  );
}

