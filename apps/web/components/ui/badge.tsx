/**
 * Badge Component
 * Small labels for status, counts, and categories
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        primary: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        success: 'bg-green-100 text-green-800 hover:bg-green-200',
        warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        error: 'bg-red-100 text-red-800 hover:bg-red-200',
        info: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
        purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
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
 * ```
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      icon,
      removable,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={badgeVariants({ variant, size, className })}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
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
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, ...props }) => {
  const variantMap = {
    active: 'success' as const,
    inactive: 'default' as const,
    pending: 'warning' as const,
    error: 'error' as const,
    success: 'success' as const,
  };

  const iconMap = {
    active: (
      <svg className="h-2 w-2 fill-current" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
    ),
    inactive: (
      <svg className="h-2 w-2 fill-current" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
    ),
    pending: (
      <svg className="h-2 w-2 fill-current" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
    ),
    error: (
      <svg className="h-2 w-2 fill-current" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
    ),
    success: (
      <svg className="h-2 w-2 fill-current" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
    ),
  };

  return (
    <Badge variant={variantMap[status]} icon={iconMap[status]} {...props}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

/**
 * Count Badge - For numerical indicators
 */
export interface CountBadgeProps extends Omit<BadgeProps, 'children'> {
  count: number;
  max?: number;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max = 99,
  ...props
}) => {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  return (
    <Badge {...props} aria-label={`${count} items`}>
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

export const DotBadge: React.FC<DotBadgeProps> = ({ pulse, className, ...props }) => {
  return (
    <span className="relative inline-flex">
      <Badge
        {...props}
        className={`h-2 w-2 rounded-full p-0 ${className || ''}`}
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
