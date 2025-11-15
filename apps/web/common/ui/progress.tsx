/**
 * Progress Component
 * Progress bars and indicators
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const progressVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-gray-200',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
        xl: 'h-4',
      },
      variant: {
        default: '[&>div]:bg-gray-900',
        primary: '[&>div]:bg-blue-600',
        success: '[&>div]:bg-green-600',
        warning: '[&>div]:bg-yellow-600',
        error: '[&>div]:bg-red-600',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
);

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  /**
   * Progress value (0-100)
   */
  value: number;
  
  /**
   * Maximum value
   */
  max?: number;
  
  /**
   * Show label
   */
  showLabel?: boolean;
  
  /**
   * Animated
   */
  animated?: boolean;
  
  /**
   * Indeterminate state
   */
  indeterminate?: boolean;
}

/**
 * Progress bar component
 * 
 * @example
 * ```tsx
 * <Progress value={75} showLabel />
 * <Progress value={50} variant="success" />
 * ```
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      size,
      variant,
      value,
      max = 100,
      showLabel = false,
      animated = false,
      indeterminate = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div ref={ref} className="w-full" {...props}>
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={showLabel ? undefined : `${percentage}% complete`}
          className={progressVariants({ size, variant, className })}
        >
          <div
            className={`h-full transition-all duration-300 ${
              animated ? 'animate-pulse' : ''
            } ${indeterminate ? 'animate-[progress_1.5s_ease-in-out_infinite]' : ''}`}
            style={{
              width: indeterminate ? '30%' : `${percentage}%`,
            }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 flex justify-between text-xs text-gray-600">
            <span>{Math.round(percentage)}%</span>
            <span>{value} / {max}</span>
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

/**
 * Progress with steps
 */
export interface ProgressStepsProps {
  steps: Array<{
    id: string;
    label: string;
    completed: boolean;
  }>;
  currentStep: number;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  step.completed || index < currentStep
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : index === currentStep
                    ? 'border-blue-600 bg-white text-blue-600'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}
              >
                {step.completed || index < currentStep ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <span className="mt-2 text-xs text-gray-600">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 border-t-2 border-gray-300" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/**
 * Circular progress
 */
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  variant = 'primary',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    default: 'text-gray-900',
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
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
          className={`${colorMap[variant]} transition-all duration-300`}
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
          <span className="text-xs text-gray-600">{value} / {max}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Multi progress bar
 */
export interface MultiProgressProps {
  segments: Array<{
    id: string;
    label: string;
    value: number;
    color: string;
  }>;
  max?: number;
  size?: ProgressProps['size'];
  showLabels?: boolean;
}

export const MultiProgress: React.FC<MultiProgressProps> = ({
  segments,
  max = 100,
  size = 'md',
  showLabels = true,
}) => {
  const sizeMap = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  return (
    <div className="w-full">
      <div className={`flex w-full overflow-hidden rounded-full bg-gray-200 ${sizeMap[size || 'md']}`}>
        {segments.map((segment) => {
          const percentage = Math.min((segment.value / max) * 100, 100);
          return (
            <div
              key={segment.id}
              className="transition-all duration-300"
              style={{
                width: `${percentage}%`,
                backgroundColor: segment.color,
              }}
              title={`${segment.label}: ${Math.round(percentage)}%`}
            />
          );
        })}
      </div>
      {showLabels && (
        <div className="mt-2 flex flex-wrap gap-2">
          {segments.map((segment) => (
            <div key={segment.id} className="flex items-center gap-1 text-xs">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-gray-600">
                {segment.label}: {segment.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Progress with animation
 */
export interface AnimatedProgressProps extends Omit<ProgressProps, 'animated'> {
  duration?: number;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  duration = 1000,
  ...props
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setDisplayValue(startValue + diff * progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <Progress {...props} value={displayValue} animated />;
};

// Add CSS for indeterminate animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes progress {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(400%);
      }
    }
  `;
  document.head.appendChild(style);
}
