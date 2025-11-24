/**
 * Button Component
 * Comprehensive button component with multiple variants and states
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900',
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-200',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-600',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-600',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
        outline:
          'border-2 border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
        link: 'text-blue-600 underline-offset-4 hover:underline focus:ring-blue-600',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl',
        icon: 'p-2',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Icon to display before the label
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icon to display after the label
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Render as a different element
   */
  asChild?: boolean;
}

/**
 * Button component with multiple variants and states
 * 
 * @example
 * ```tsx
 * <Button>Click me</Button>
 * <Button variant="primary" size="lg">Large Primary</Button>
 * <Button loading leftIcon={<Icon />}>Loading...</Button>
 * <Button variant="outline" rightIcon={<Arrow />}>Next</Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={buttonVariants({ variant, size, fullWidth, className })}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * Icon Button - Button with only an icon
 */
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', ...props }, ref) => {
    return (
      <Button ref={ref} size={size} {...props}>
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

/**
 * Button Group - Group of buttons
 */
export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md';
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
  orientation = 'horizontal',
  spacing = 'sm',
}) => {
  const spacingClasses = {
    none: '',
    sm: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    md: orientation === 'horizontal' ? 'space-x-4' : 'space-y-4',
  };

  const orientationClasses =
    orientation === 'horizontal' ? 'flex-row' : 'flex-col';

  return (
    <div className={`flex ${orientationClasses} ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Split Button - Button with a dropdown menu
 */
export interface SplitButtonProps extends ButtonProps {
  onDropdownClick?: () => void;
  dropdownIcon?: React.ReactNode;
}

export const SplitButton = React.forwardRef<HTMLButtonElement, SplitButtonProps>(
  ({ children, onDropdownClick, dropdownIcon, variant, size, ...props }, ref) => {
    const DefaultDropdownIcon = (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );

    return (
      <div className="inline-flex">
        <Button ref={ref} variant={variant} size={size} className="rounded-r-none" {...props}>
          {children}
        </Button>
        <button
          type="button"
          onClick={onDropdownClick}
          className={buttonVariants({
            variant,
            size,
            className: 'rounded-l-none border-l border-white/20',
          })}
          aria-label="Open dropdown"
        >
          {dropdownIcon || DefaultDropdownIcon}
        </button>
      </div>
    );
  }
);

SplitButton.displayName = 'SplitButton';

/**
 * Copy Button - Button for copying text
 */
export interface CopyButtonProps extends Omit<ButtonProps, 'onClick'> {
  value: string;
  onCopy?: () => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  onCopy,
  children = 'Copy',
  ...props
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button onClick={handleCopy} {...props}>
      {copied ? 'Copied!' : children}
    </Button>
  );
};

/**
 * Loading Button - Button with built-in loading state
 */
export interface LoadingButtonProps extends ButtonProps {
  loadingText?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  loadingText = 'Loading...',
  children,
  ...props
}) => {
  return (
    <Button loading={loading} {...props}>
      {loading ? loadingText : children}
    </Button>
  );
};

