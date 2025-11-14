/**
 * Skeleton Component
 * Loading placeholders for content
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const skeletonVariants = cva(
  'animate-pulse rounded bg-gray-200',
  {
    variants: {
      variant: {
        default: 'bg-gray-200',
        light: 'bg-gray-100',
        dark: 'bg-gray-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /**
   * Width of skeleton
   */
  width?: string | number;
  
  /**
   * Height of skeleton
   */
  height?: string | number;
  
  /**
   * Whether skeleton is circular
   */
  circle?: boolean;
}

/**
 * Basic skeleton loader
 * 
 * @example
 * ```tsx
 * <Skeleton width="100%" height={20} />
 * <Skeleton circle width={40} height={40} />
 * ```
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant,
      width = '100%',
      height = 16,
      circle = false,
      style,
      ...props
    },
    ref
  ) => {
    const computedStyle = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style,
    };

    return (
      <div
        ref={ref}
        className={skeletonVariants({
          variant,
          className: `${className || ''} ${circle ? 'rounded-full' : ''}`,
        })}
        style={computedStyle}
        aria-label="Loading..."
        role="status"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * Text skeleton with multiple lines
 */
export interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: string;
  lineHeight?: number;
  spacing?: number;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lastLineWidth = '60%',
  lineHeight = 16,
  spacing = 8,
}) => {
  return (
    <div className="w-full space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          style={{ marginBottom: index < lines - 1 ? spacing : 0 }}
        />
      ))}
    </div>
  );
};

/**
 * Avatar skeleton
 */
export interface SkeletonAvatarProps {
  size?: number;
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({ size = 40 }) => {
  return <Skeleton circle width={size} height={size} />;
};

/**
 * Card skeleton
 */
export interface SkeletonCardProps {
  hasImage?: boolean;
  imageHeight?: number;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  hasImage = true,
  imageHeight = 200,
  lines = 3,
}) => {
  return (
    <div className="w-full rounded-lg border border-gray-200 p-4">
      {hasImage && <Skeleton height={imageHeight} className="mb-4" />}
      <SkeletonText lines={lines} />
    </div>
  );
};

/**
 * List item skeleton
 */
export interface SkeletonListItemProps {
  hasAvatar?: boolean;
  avatarSize?: number;
  lines?: number;
}

export const SkeletonListItem: React.FC<SkeletonListItemProps> = ({
  hasAvatar = true,
  avatarSize = 40,
  lines = 2,
}) => {
  return (
    <div className="flex items-start gap-3">
      {hasAvatar && <SkeletonAvatar size={avatarSize} />}
      <div className="flex-1">
        <SkeletonText lines={lines} />
      </div>
    </div>
  );
};

/**
 * Table skeleton
 */
export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="w-full">
      {/* Table header */}
      <div className="mb-2 flex gap-2">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} height={32} className="flex-1" />
        ))}
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="mb-2 flex gap-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} height={48} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Button skeleton
 */
export interface SkeletonButtonProps {
  width?: string | number;
  height?: number;
}

export const SkeletonButton: React.FC<SkeletonButtonProps> = ({
  width = 100,
  height = 40,
}) => {
  return <Skeleton width={width} height={height} className="rounded-md" />;
};

/**
 * Input skeleton
 */
export interface SkeletonInputProps {
  width?: string | number;
  height?: number;
}

export const SkeletonInput: React.FC<SkeletonInputProps> = ({
  width = '100%',
  height = 40,
}) => {
  return <Skeleton width={width} height={height} className="rounded-md" />;
};

/**
 * Badge skeleton
 */
export const SkeletonBadge: React.FC = () => {
  return <Skeleton width={60} height={24} className="rounded-full" />;
};

/**
 * Chart skeleton
 */
export interface SkeletonChartProps {
  height?: number;
}

export const SkeletonChart: React.FC<SkeletonChartProps> = ({ height = 300 }) => {
  return (
    <div className="w-full" style={{ height }}>
      <Skeleton height="100%" />
    </div>
  );
};

/**
 * Profile skeleton
 */
export const SkeletonProfile: React.FC = () => {
  return (
    <div className="flex items-start gap-4">
      <SkeletonAvatar size={80} />
      <div className="flex-1">
        <Skeleton width="40%" height={24} className="mb-2" />
        <Skeleton width="60%" height={16} className="mb-4" />
        <SkeletonText lines={3} />
      </div>
    </div>
  );
};

/**
 * Grid skeleton
 */
export interface SkeletonGridProps {
  items?: number;
  columns?: number;
  itemHeight?: number;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  items = 6,
  columns = 3,
  itemHeight = 200,
}) => {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: items }).map((_, index) => (
        <Skeleton key={index} height={itemHeight} />
      ))}
    </div>
  );
};

/**
 * Dashboard skeleton
 */
export const SkeletonDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton width="30%" height={32} />
        <SkeletonButton width={120} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-gray-200 p-4">
            <Skeleton width="60%" height={16} className="mb-2" />
            <Skeleton width="40%" height={32} />
          </div>
        ))}
      </div>

      {/* Chart */}
      <SkeletonChart height={300} />

      {/* Table */}
      <SkeletonTable rows={5} columns={4} />
    </div>
  );
};

/**
 * Form skeleton
 */
export interface SkeletonFormProps {
  fields?: number;
}

export const SkeletonForm: React.FC<SkeletonFormProps> = ({ fields = 4 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          <Skeleton width="30%" height={16} className="mb-2" />
          <SkeletonInput />
        </div>
      ))}
      <div className="flex gap-2">
        <SkeletonButton width={100} />
        <SkeletonButton width={100} />
      </div>
    </div>
  );
};
