'use client';

import * as React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  disableBeacon?: boolean;
  spotlightPadding?: number;
}

export interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  showProgress?: boolean;
  showSkip?: boolean;
  className?: string;
}

export function OnboardingTour({
  steps,
  isOpen,
  onClose,
  onComplete,
  showProgress = true,
  showSkip = true,
  className,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [targetPosition, setTargetPosition] = React.useState({ top: 0, left: 0, width: 0, height: 0 });

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  React.useEffect(() => {
    if (!isOpen || !step) return;

    const updatePosition = () => {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });

        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, step]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen || !step) return null;

  const getTooltipPosition = () => {
    const placement = step.placement || 'bottom';
    const padding = 16;

    switch (placement) {
      case 'top':
        return {
          top: targetPosition.top - padding,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: targetPosition.top + targetPosition.height + padding,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left - padding,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left + targetPosition.width + padding,
          transform: 'translate(0, -50%)',
        };
      default:
        return {
          top: targetPosition.top + targetPosition.height + padding,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translate(-50%, 0)',
        };
    }
  };

  const tooltipStyle = getTooltipPosition();
  const spotlightPadding = step.spotlightPadding || 8;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleSkip} />

      {/* Spotlight */}
      <div
        className="fixed z-50 pointer-events-none"
        style={{
          top: targetPosition.top - spotlightPadding,
          left: targetPosition.left - spotlightPadding,
          width: targetPosition.width + spotlightPadding * 2,
          height: targetPosition.height + spotlightPadding * 2,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          borderRadius: '8px',
        }}
      />

      {/* Tooltip */}
      <Card
        className={cn('fixed z-50 w-96 max-w-[90vw]', className)}
        style={{
          top: tooltipStyle.top,
          left: tooltipStyle.left,
          transform: tooltipStyle.transform,
        }}
      >
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{step.title}</h3>
                <Badge variant="secondary">
                  {currentStep + 1} / {steps.length}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{step.content}</p>
            </div>
            {showSkip && (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {showProgress && (
            <Progress value={progress} className="h-1" />
          )}

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button onClick={handleNext} size="sm">
              {isLastStep ? 'Finish' : 'Next'}
              {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Simple step-by-step guide
export function StepGuide({
  steps,
  currentStep,
  onStepChange,
  className,
}: {
  steps: Array<{ title: string; description: string; icon?: React.ReactNode }>;
  currentStep: number;
  onStepChange: (step: number) => void;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => (
        <button
          key={index}
          onClick={() => onStepChange(index)}
          className={cn(
            'w-full flex items-start gap-4 p-4 rounded-lg border transition-colors text-left',
            index === currentStep && 'border-primary bg-primary/5',
            index < currentStep && 'opacity-50',
            index > currentStep && 'opacity-75'
          )}
        >
          <div
            className={cn(
              'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2',
              index === currentStep && 'border-primary bg-primary text-primary-foreground',
              index < currentStep && 'border-green-500 bg-green-500 text-white',
              index > currentStep && 'border-muted'
            )}
          >
            {step.icon || <span className="text-sm font-semibold">{index + 1}</span>}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">{step.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// Welcome modal with checklist
export function WelcomeChecklist({
  items,
  onComplete,
  isOpen,
  onClose,
  className,
}: {
  items: Array<{ id: string; title: string; description: string; completed?: boolean }>;
  onComplete?: () => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}) {
  const [checkedItems, setCheckedItems] = React.useState<Set<string>>(
    new Set(items.filter((item) => item.completed).map((item) => item.id))
  );

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);

    if (newChecked.size === items.length) {
      setTimeout(() => {
        onComplete?.();
        onClose();
      }, 500);
    }
  };

  if (!isOpen) return null;

  const progress = (checkedItems.size / items.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className={cn('w-full max-w-lg', className)}>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Welcome! 👋</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground">
              Complete these steps to get started
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">
                {checkedItems.size} / {items.length}
              </span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-lg border transition-colors text-left',
                  checkedItems.has(item.id) && 'bg-primary/5 border-primary'
                )}
              >
                <div
                  className={cn(
                    'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 mt-0.5',
                    checkedItems.has(item.id) &&
                      'border-primary bg-primary text-primary-foreground'
                  )}
                >
                  {checkedItems.has(item.id) && (
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </button>
            ))}
          </div>

          {checkedItems.size === items.length && (
            <Button onClick={onClose} className="w-full">
              Get Started
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

