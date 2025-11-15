/**
 * Spinner Component
 * Loading indicators for async operations
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        xs: 'h-3 w-3 border',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8 border-4',
        xl: 'h-12 w-12 border-4',
      },
      variant: {
        default: 'text-gray-900',
        primary: 'text-blue-600',
        white: 'text-white',
        muted: 'text-gray-400',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Label for accessibility
   */
  label?: string;
}

/**
 * Basic spinning loader
 * 
 * @example
 * ```tsx
 * <Spinner size="lg" label="Loading data..." />
 * ```
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, label = 'Loading...', ...props }, ref) => {
    return (
      <div ref={ref} role="status" className={className} {...props}>
        <div className={spinnerVariants({ size, variant })} />
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

/**
 * Spinner with text
 */
export interface SpinnerWithTextProps extends SpinnerProps {
  text?: string;
}

export const SpinnerWithText: React.FC<SpinnerWithTextProps> = ({
  text = 'Loading...',
  size = 'md',
  ...props
}) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <Spinner size={size} {...props} />
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
};

/**
 * Inline spinner for buttons
 */
export const InlineSpinner: React.FC<Omit<SpinnerProps, 'size'>> = (props) => {
  return <Spinner size="sm" {...props} />;
};

/**
 * Fullscreen loading overlay
 */
export interface FullscreenSpinnerProps extends SpinnerProps {
  text?: string;
  overlay?: boolean;
}

export const FullscreenSpinner: React.FC<FullscreenSpinnerProps> = ({
  text,
  overlay = true,
  size = 'xl',
  ...props
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${
        overlay ? 'bg-white/80 backdrop-blur-sm' : ''
      }`}
    >
      <Spinner size={size} {...props} />
      {text && <p className="mt-4 text-sm text-gray-600">{text}</p>}
    </div>
  );
};

/**
 * Dots spinner variant
 */
export interface DotsSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'white';
}

export const DotsSpinner: React.FC<DotsSpinnerProps> = ({
  size = 'md',
  variant = 'default',
}) => {
  const sizeMap = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
  };

  const colorMap = {
    default: 'bg-gray-900',
    primary: 'bg-blue-600',
    white: 'bg-white',
  };

  const dotClass = `${sizeMap[size]} ${colorMap[variant]} rounded-full`;

  return (
    <div className="flex items-center gap-1" role="status">
      <div className={`${dotClass} animate-pulse [animation-delay:-0.3s]`} />
      <div className={`${dotClass} animate-pulse [animation-delay:-0.15s]`} />
      <div className={`${dotClass} animate-pulse`} />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Progress spinner with percentage
 */
export interface ProgressSpinnerProps extends SpinnerProps {
  progress: number; // 0-100
  showPercentage?: boolean;
}

export const ProgressSpinner: React.FC<ProgressSpinnerProps> = ({
  progress,
  showPercentage = true,
  size = 'lg',
  variant = 'primary',
}) => {
  const circumference = 2 * Math.PI * 40; // radius = 40
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90" width="100" height="100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`text-${variant === 'primary' ? 'blue' : 'gray'}-600 transition-all duration-300`}
          strokeLinecap="round"
        />
      </svg>
      {showPercentage && (
        <span className="absolute text-lg font-semibold">{Math.round(progress)}%</span>
      )}
    </div>
  );
};

/**
 * Pulse loader
 */
export interface PulseLoaderProps {
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'white';
}

export const PulseLoader: React.FC<PulseLoaderProps> = ({
  count = 3,
  size = 'md',
  variant = 'default',
}) => {
  const sizeMap = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const colorMap = {
    default: 'bg-gray-900',
    primary: 'bg-blue-600',
    white: 'bg-white',
  };

  return (
    <div className="flex items-center gap-2" role="status">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${sizeMap[size]} ${colorMap[variant]} rounded-full animate-bounce`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Bar loader
 */
export interface BarLoaderProps {
  width?: string;
  height?: string;
  variant?: 'default' | 'primary';
}

export const BarLoader: React.FC<BarLoaderProps> = ({
  width = '100%',
  height = '4px',
  variant = 'primary',
}) => {
  const colorMap = {
    default: 'bg-gray-900',
    primary: 'bg-blue-600',
  };

  return (
    <div
      className="relative overflow-hidden bg-gray-200"
      style={{ width, height }}
      role="status"
    >
      <div
        className={`absolute h-full ${colorMap[variant]} animate-[shimmer_1.5s_infinite]`}
        style={{
          width: '50%',
          animation: 'shimmer 1.5s ease-in-out infinite',
        }}
      />
      <span className="sr-only">Loading...</span>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
};

