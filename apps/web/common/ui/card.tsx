/**
 * Card Component
 * Flexible card component for content containers
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'rounded-lg border bg-white transition-all',
  {
    variants: {
      variant: {
        default: 'border-gray-200',
        elevated: 'border-gray-200 shadow-md hover:shadow-lg',
        outlined: 'border-2 border-gray-300',
        ghost: 'border-transparent',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:border-blue-300 hover:shadow-md',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      interactive: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Card header content
   */
  header?: React.ReactNode;
  
  /**
   * Card footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Whether the card is loading
   */
  loading?: boolean;
}

/**
 * Card component for content containers
 * 
 * @example
 * ```tsx
 * <Card header="Title" footer="Footer">
 *   Card content
 * </Card>
 * <Card variant="elevated" interactive onClick={() => {}}>
 *   Clickable card
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      interactive,
      header,
      footer,
      loading,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cardVariants({ variant, padding, interactive, className })}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={
          interactive && props.onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  (props.onClick as any)(e);
                }
              }
            : undefined
        }
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        ) : (
          <>
            {header && (
              <div className="border-b border-gray-200 pb-4 mb-4">
                {typeof header === 'string' ? (
                  <h3 className="text-lg font-semibold text-gray-900">{header}</h3>
                ) : (
                  header
                )}
              </div>
            )}
            <div>{children}</div>
            {footer && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                {footer}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header Component
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  description,
  action,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex items-start justify-between ${className}`} {...props}>
      <div className="flex-1">
        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        {children}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
};

/**
 * Card Content Component
 */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent: React.FC<CardContentProps> = ({
  className = '',
  ...props
}) => {
  return <div className={`text-gray-700 ${className}`} {...props} />;
};

/**
 * Card Footer Component
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  align = 'right',
  className = '',
  ...props
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div
      className={`flex items-center ${alignClasses[align]} ${className}`}
      {...props}
    />
  );
};

/**
 * Stat Card - Card for displaying statistics
 */
export interface StatCardProps extends Omit<CardProps, 'header' | 'footer' | 'children'> {
  label: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon,
  ...props
}) => {
  const trendColor = change?.trend === 'up' ? 'text-green-600' : 'text-red-600';
  const trendIcon = change?.trend === 'up' ? '↑' : '↓';

  return (
    <Card variant="elevated" {...props}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`mt-2 text-sm font-medium ${trendColor}`}>
              {trendIcon} {Math.abs(change.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Feature Card - Card for displaying features
 */
export interface FeatureCardProps extends Omit<CardProps, 'children'> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  action,
  ...props
}) => {
  return (
    <Card variant="elevated" {...props}>
      {icon && (
        <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-3 text-blue-600">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
};

/**
 * Profile Card - Card for displaying profile information
 */
export interface ProfileCardProps extends Omit<CardProps, 'children'> {
  avatar?: string;
  name: string;
  role?: string;
  bio?: string;
  actions?: React.ReactNode;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  avatar,
  name,
  role,
  bio,
  actions,
  ...props
}) => {
  return (
    <Card variant="elevated" {...props}>
      <div className="flex flex-col items-center text-center">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-2xl font-bold text-gray-600">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <h3 className="mt-4 text-xl font-bold text-gray-900">{name}</h3>
        {role && <p className="text-sm text-gray-600">{role}</p>}
        {bio && <p className="mt-2 text-sm text-gray-700">{bio}</p>}
        {actions && <div className="mt-4 flex gap-2">{actions}</div>}
      </div>
    </Card>
  );
};

/**
 * Image Card - Card with an image
 */
export interface ImageCardProps extends Omit<CardProps, 'children'> {
  image: string;
  imageAlt?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  imageAlt = '',
  title,
  description,
  actions,
  ...props
}) => {
  return (
    <Card padding="none" variant="elevated" {...props}>
      <img
        src={image}
        alt={imageAlt}
        className="h-48 w-full rounded-t-lg object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {description && <p className="mt-2 text-gray-600">{description}</p>}
        {actions && <div className="mt-4">{actions}</div>}
      </div>
    </Card>
  );
};

