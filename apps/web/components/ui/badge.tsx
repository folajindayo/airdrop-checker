/**
 * Badge Component System
 * 
 * Unified badge component for labels, status indicators, and tags with:
 * - Multiple variants using CVA
 * - Size options (sm, md, lg)
 * - Pill or rounded styling
 * - Icon support
 * - Removable badges
 * - Status and count specialized variants
 */

'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100',
        primary: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        success: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100',
        warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100',
        danger: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100',
        error: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100',
        info: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-900 dark:text-cyan-100',
        purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-100',
        outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300',
        ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
      },
      pill: {
        true: 'rounded-full',
        false: 'rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      pill: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Icon to display before text
   */
  icon?: React.ReactNode;
  
  /**
   * Icon to display after text
   */
  suffixIcon?: React.ReactNode;
  
  /**
   * Whether the badge can be removed
   */
  removable?: boolean;
  
  /**
   * Remove handler
   */
  onRemove?: () => void;
}

/**
 * Badge component for labels and status indicators
 * 
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error" removable onRemove={() => {}}>Error</Badge>
 * <Badge pill icon={<Icon />}>With Icon</Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      pill,
      icon,
      suffixIcon,
      removable,
      onRemove,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, pill }), className)}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
        {suffixIcon && <span className="ml-1">{suffixIcon}</span>}
        {removable && (
          <button
            type="button"
            onClick={handleRemove}
            className="ml-1 inline-flex items-center justify-center rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-offset-1"
            aria-label="Remove badge"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

/**
 * Status Badge - For status indicators
 */
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'confirmed' | 'rumored' | 'speculative' | 'expired' | 'active' | 'inactive' | 'pending' | 'error' | 'success';
}

const statusVariantMap = {
  confirmed: 'success' as const,
  rumored: 'warning' as const,
  speculative: 'secondary' as const,
  expired: 'danger' as const,
  active: 'success' as const,
  inactive: 'default' as const,
  pending: 'warning' as const,
  error: 'error' as const,
  success: 'success' as const,
};

const statusLabelMap = {
  confirmed: 'Confirmed',
  rumored: 'Rumored',
  speculative: 'Speculative',
  expired: 'Expired',
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  error: 'Error',
  success: 'Success',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children, ...props }) => {
  const statusIcon = (
    <svg className="h-2 w-2 fill-current" viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="3" />
    </svg>
  );

  return (
    <Badge variant={statusVariantMap[status]} icon={statusIcon} pill {...props}>
      {children || statusLabelMap[status]}
    </Badge>
  );
};

/**
 * Count Badge - For numerical indicators
 */
export interface CountBadgeProps extends Omit<BadgeProps, 'children'> {
  count: number;
  max?: number;
  showZero?: boolean;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max = 99,
  showZero = false,
  ...props
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();
  
  return (
    <Badge variant="primary" pill size="sm" {...props} aria-label={`${count} items`}>
      {displayCount}
    </Badge>
  );
};

/**
 * Dot Badge - Simple indicator without text
 */
export interface DotBadgeProps extends Omit<BadgeProps, 'children' | 'size'> {
  pulse?: boolean;
}

export const DotBadge: React.FC<DotBadgeProps> = ({ pulse, className, variant = 'primary', ...props }) => {
  return (
    <span className="relative inline-flex">
      <Badge
        {...props}
        variant={variant}
        pill
        size="sm"
        className={cn('h-2 w-2 p-0', className)}
      >
        <span className="sr-only">Status indicator</span>
      </Badge>
      {pulse && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
      )}
    </span>
  );
};

/**
 * Badge Group - For displaying multiple badges
 */
export interface BadgeGroupProps {
  badges: Array<{
    id: string;
    label: string;
    variant?: BadgeProps['variant'];
    removable?: boolean;
    onRemove?: () => void;
  }>;
  max?: number;
  size?: BadgeProps['size'];
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  badges,
  max = 5,
  size = 'md',
}) => {
  const visibleBadges = badges.slice(0, max);
  const remainingCount = badges.length - max;

  return (
    <div className="flex flex-wrap gap-1">
      {visibleBadges.map((badge) => (
        <Badge
          key={badge.id}
          variant={badge.variant}
          size={size}
          removable={badge.removable}
          onRemove={badge.onRemove}
        >
          {badge.label}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" size={size}>
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
};
