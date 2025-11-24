/**
 * Badge Component
 * Versatile badge component for labels, status, and tags
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-gray-900 text-white hover:bg-gray-800',
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        success: 'bg-green-600 text-white hover:bg-green-700',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-100',
        ghost: 'text-gray-700 hover:bg-gray-100',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
      },
      pill: {
        true: 'rounded-full',
        false: '',
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
   * Icon to display before the label
   */
  icon?: React.ReactNode;
  
  /**
   * Icon to display after the label
   */
  suffixIcon?: React.ReactNode;
  
  /**
   * Click handler for badge
   */
  onClick?: () => void;
  
  /**
   * Whether the badge is clickable/removable
   */
  removable?: boolean;
  
  /**
   * Remove handler
   */
  onRemove?: () => void;
}

/**
 * Badge component for displaying labels, status, and tags
 * 
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning" size="sm">Pending</Badge>
 * <Badge variant="danger" pill removable onRemove={() => {}}>Remove me</Badge>
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
      children,
      onClick,
      removable,
      onRemove,
      ...props
    },
    ref
  ) => {
    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };

    const badgeContent = (
      <>
        {icon && <span className="mr-1">{icon}</span>}
        {children}
        {suffixIcon && <span className="ml-1">{suffixIcon}</span>}
        {removable && (
          <button
            type="button"
            onClick={handleRemove}
            className="ml-1 hover:opacity-70 focus:outline-none"
            aria-label="Remove badge"
          >
            <svg
              className="h-3 w-3"
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
          </button>
        )}
      </>
    );

    return (
      <span
        ref={ref}
        className={badgeVariants({ variant, size, pill, className })}
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
        {badgeContent}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

/**
 * Status Badge - Preset badge for status indicators
 */
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'confirmed' | 'rumored' | 'speculative' | 'expired' | 'active' | 'inactive';
}

const statusVariantMap = {
  confirmed: 'success' as const,
  rumored: 'warning' as const,
  speculative: 'secondary' as const,
  expired: 'danger' as const,
  active: 'success' as const,
  inactive: 'secondary' as const,
};

const statusLabelMap = {
  confirmed: 'Confirmed',
  rumored: 'Rumored',
  speculative: 'Speculative',
  expired: 'Expired',
  active: 'Active',
  inactive: 'Inactive',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children, ...props }) => {
  return (
    <Badge variant={statusVariantMap[status]} {...props}>
      {children || statusLabelMap[status]}
    </Badge>
  );
};

/**
 * Count Badge - Badge with a numeric count
 */
export interface CountBadgeProps extends BadgeProps {
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

  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge variant="primary" pill size="sm" {...props}>
      {displayCount}
    </Badge>
  );
};

/**
 * Dot Badge - Small dot indicator
 */
export interface DotBadgeProps extends Omit<BadgeProps, 'children'> {
  pulse?: boolean;
}

export const DotBadge: React.FC<DotBadgeProps> = ({ pulse, className, ...props }) => {
  return (
    <Badge
      pill
      size="sm"
      className={`h-2 w-2 p-0 ${pulse ? 'animate-pulse' : ''} ${className || ''}`}
      {...props}
    />
  );
};

