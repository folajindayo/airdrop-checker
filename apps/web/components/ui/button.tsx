/**
 * Button Component System
 * 
 * Unified button component consolidating all variants with:
 * - Multiple variants using CVA for type-safe styling
 * - Size options (xs, sm, md, lg, xl, icon)
 * - Loading states with spinner
 * - Icon support (left, right, only)
 * - Full width option
 * - Button groups and specialized variants
 * - Complete accessibility support
 */

'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900 active:bg-gray-950 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200',
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 active:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 active:bg-blue-100 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-950',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:bg-green-800',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 active:bg-yellow-800',
        link: 'text-blue-600 underline-offset-4 hover:underline focus:ring-blue-500 dark:text-blue-500',
      },
      size: {
        xs: 'text-xs px-2.5 py-1.5 h-7',
        sm: 'text-sm px-3 py-2 h-8',
        md: 'text-base px-4 py-2.5 h-10',
        lg: 'text-lg px-5 py-3 h-12',
        xl: 'text-xl px-6 py-4 h-14',
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
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

/**
 * Button Component
 * 
 * A fully accessible button component with multiple variants,
 * sizes, loading states, and icon support using CVA for type-safe styling.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size,
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth,
      children,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const iconSizeClasses = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-7 w-7',
      icon: 'h-5 w-5',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          buttonVariants({ variant, size, fullWidth }),
          'gap-2',
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className={cn('animate-spin', iconSizeClasses[size || 'md'])}
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
        {!loading && leftIcon && (
          <span className={cn(iconSizeClasses[size || 'md'])}>{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className={cn(iconSizeClasses[size || 'md'])}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * Icon Button Component
 * 
 * A button that only displays an icon, with proper accessibility.
 */
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', className, ...props }, ref) => {
    const sizeClasses = {
      xs: 'h-7 w-7',
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-14 w-14',
      icon: 'h-10 w-10',
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={cn('!px-0', sizeClasses[size || 'icon'], className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

/**
 * Button Group Component
 * 
 * Groups multiple buttons together with connected styling.
 */
export interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  className,
}) => {
  return (
    <div
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        className
      )}
      role="group"
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;

        return React.cloneElement(child as React.ReactElement<any>, {
          className: cn(
            child.props.className,
            orientation === 'horizontal' && [
              !isFirst && 'border-l-0 rounded-l-none',
              !isLast && 'rounded-r-none',
            ],
            orientation === 'vertical' && [
              !isFirst && 'border-t-0 rounded-t-none',
              !isLast && 'rounded-b-none',
            ]
          ),
        });
      })}
    </div>
  );
};

/**
 * Link Button Component
 * 
 * A button styled as a link for navigation.
 */
export interface LinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ children, size = 'md', disabled = false, className, ...props }, ref) => {
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    };

    return (
      <a
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 font-medium text-blue-600 transition-colors hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-500 dark:hover:text-blue-400',
          sizeClasses[size],
          disabled && 'pointer-events-none cursor-not-allowed opacity-50',
          className
        )}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </a>
    );
  }
);

LinkButton.displayName = 'LinkButton';

/**
 * Close Button Component
 * 
 * A specialized button for closing modals, drawers, etc.
 */
export interface CloseButtonProps extends Omit<ButtonProps, 'children'> {
  'aria-label'?: string;
}

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ 'aria-label': ariaLabel = 'Close', size = 'sm', ...props }, ref) => {
    return (
      <IconButton
        ref={ref}
        size={size}
        variant="ghost"
        aria-label={ariaLabel}
        icon={
          <svg
            className="h-full w-full"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        }
        {...props}
      />
    );
  }
);

CloseButton.displayName = 'CloseButton';

/**
 * Copy Button Component
 * 
 * A button that copies text to clipboard with visual feedback.
 */
export interface CopyButtonProps extends Omit<ButtonProps, 'onClick'> {
  text: string;
  onCopy?: () => void;
}

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  ({ text, onCopy, children, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        onCopy?.();
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    };

    return (
      <Button ref={ref} onClick={handleCopy} {...props}>
        {copied ? (
          <>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Copied!
          </>
        ) : (
          children || (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy
            </>
          )
        )}
      </Button>
    );
  }
);

CopyButton.displayName = 'CopyButton';

/**
 * Split Button Component
 * 
 * Button with a dropdown menu trigger.
 */
export interface SplitButtonProps extends ButtonProps {
  onDropdownClick?: () => void;
  dropdownIcon?: React.ReactNode;
}

export const SplitButton = forwardRef<HTMLButtonElement, SplitButtonProps>(
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
          className={cn(
            buttonVariants({ variant, size }),
            'rounded-l-none border-l border-white/20'
          )}
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
 * Loading Button Component
 * 
 * Button with built-in loading state management.
 */
export interface LoadingButtonProps extends ButtonProps {
  loadingText?: string;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, loadingText = 'Loading...', children, ...props }, ref) => {
    return (
      <Button ref={ref} loading={loading} {...props}>
        {loading ? loadingText : children}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';
