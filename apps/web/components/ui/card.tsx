/**
 * Card Component System
 * 
 * Unified card components with comprehensive features:
 * - Multiple variants using CVA (elevated, outlined, filled, ghost)
 * - Flexible padding options
 * - Header, body, and footer sections
 * - Hover and interactive effects
 * - Loading states
 * - Image support
 * - Specialized card types (Stats, Feature, Profile, Image)
 * - Grid layout support
 */

'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-lg transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700',
        elevated: 'bg-white shadow-md hover:shadow-lg dark:bg-gray-800',
        outlined: 'bg-white border-2 border-gray-300 dark:bg-gray-800 dark:border-gray-600',
        filled: 'bg-gray-50 dark:bg-gray-900',
        ghost: 'bg-transparent border-transparent',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:border-blue-300 hover:shadow-md hover:scale-[1.01]',
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
  loading?: boolean;
  as?: 'div' | 'article' | 'section';
  hoverable?: boolean;
}

/**
 * Card Component
 * 
 * A flexible container for grouping related content with CVA variants.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant,
      padding,
      interactive,
      hoverable = false,
      loading = false,
      as: Component = 'div',
      children,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const isInteractive = interactive || hoverable || !!onClick;

    return (
      <Component
        ref={ref}
        className={cn(
          cardVariants({ variant, padding, interactive: isInteractive }),
          loading && 'pointer-events-none opacity-60',
          className
        )}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          isInteractive && onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick(e as any);
                }
              }
            : undefined
        }
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          </div>
        ) : (
          children
        )}
      </Component>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header Component
 * 
 * Header section for cards with title and optional actions.
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, actions, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between gap-4',
          className
        )}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * Card Body Component
 * 
 * Main content area of the card.
 */
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ noPadding = false, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'text-gray-700 dark:text-gray-300',
          !noPadding && 'mt-4',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

/**
 * Card Content Component  
 * 
 * Alternative name for CardBody for consistency with other frameworks.
 */
export type CardContentProps = CardBodyProps;
export const CardContent = CardBody;

/**
 * Card Footer Component
 * 
 * Footer section for actions or additional information.
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ align = 'right', children, className, ...props }, ref) => {
    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'mt-6 flex items-center gap-2',
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

/**
 * Card Image Component
 * 
 * Image for cards with optional aspect ratio.
 */
export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: '16/9' | '4/3' | '1/1' | 'auto';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const CardImage = forwardRef<HTMLImageElement, CardImageProps>(
  (
    {
      aspectRatio = '16/9',
      position = 'top',
      className,
      alt,
      ...props
    },
    ref
  ) => {
    const aspectRatioClasses = {
      '16/9': 'aspect-video',
      '4/3': 'aspect-4/3',
      '1/1': 'aspect-square',
      'auto': '',
    };

    const positionClasses = {
      top: 'rounded-t-lg',
      bottom: 'rounded-b-lg',
      left: 'rounded-l-lg',
      right: 'rounded-r-lg',
    };

    return (
      <img
        ref={ref}
        alt={alt}
        className={cn(
          'w-full object-cover',
          aspectRatioClasses[aspectRatio],
          positionClasses[position],
          className
        )}
        {...props}
      />
    );
  }
);

CardImage.displayName = 'CardImage';

/**
 * Card Divider Component
 * 
 * Visual separator for card sections.
 */
export const CardDivider = forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => {
  return (
    <hr
      ref={ref}
      className={cn(
        'my-4 border-t border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    />
  );
});

CardDivider.displayName = 'CardDivider';

/**
 * Clickable Card Component
 * 
 * A card that acts as a button or link.
 */
export interface ClickableCardProps extends CardProps {
  href?: string;
  onClick?: () => void;
}

export const ClickableCard = forwardRef<HTMLDivElement, ClickableCardProps>(
  ({ href, onClick, children, ...props }, ref) => {
    if (href) {
      return (
        <a href={href} className="block no-underline">
          <Card ref={ref} hoverable {...props}>
            {children}
          </Card>
        </a>
      );
    }

    return (
      <Card
        ref={ref}
        hoverable
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

ClickableCard.displayName = 'ClickableCard';

/**
 * Card Grid Component
 * 
 * Grid layout for displaying multiple cards.
 */
export interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export const CardGrid: React.FC<CardGridProps> = ({
  columns = 3,
  gap = 'md',
  children,
  className,
  ...props
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Stats Card Component
 * 
 * A specialized card for displaying statistics.
 */
export interface StatsCardProps extends Omit<CardProps, 'children'> {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  (
    {
      label,
      value,
      change,
      changeLabel,
      icon,
      trend = 'neutral',
      ...props
    },
    ref
  ) => {
    const trendColors = {
      up: 'text-green-600 dark:text-green-400',
      down: 'text-red-600 dark:text-red-400',
      neutral: 'text-gray-600 dark:text-gray-400',
    };

    const trendIcons = {
      up: '↑',
      down: '↓',
      neutral: '→',
    };

    return (
      <Card ref={ref} {...props}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
              {value}
            </p>
            {change !== undefined && (
              <div className={cn('mt-2 flex items-center gap-1 text-sm', trendColors[trend])}>
                <span>{trendIcons[trend]}</span>
                <span className="font-medium">{Math.abs(change)}%</span>
                {changeLabel && <span className="text-gray-500">{changeLabel}</span>}
              </div>
            )}
          </div>
          {icon && (
            <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
              {icon}
            </div>
          )}
        </div>
      </Card>
    );
  }
);

StatsCard.displayName = 'StatsCard';

/**
 * Feature Card Component
 * 
 * A card optimized for showcasing features.
 */
export interface FeatureCardProps extends Omit<CardProps, 'children'> {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon, title, description, action, ...props }, ref) => {
    return (
      <Card ref={ref} {...props}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-blue-100 p-4 dark:bg-blue-900">
            {icon}
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {description}
          </p>
          {action}
        </div>
      </Card>
    );
  }
);

FeatureCard.displayName = 'FeatureCard';

/**
 * Profile Card Component
 * 
 * Card optimized for displaying user profile information.
 */
export interface ProfileCardProps extends Omit<CardProps, 'children'> {
  avatar?: string;
  name: string;
  role?: string;
  bio?: string;
  actions?: React.ReactNode;
}

export const ProfileCard = forwardRef<HTMLDivElement, ProfileCardProps>(
  ({ avatar, name, role, bio, actions, ...props }, ref) => {
    return (
      <Card ref={ref} {...props}>
        <div className="flex flex-col items-center text-center">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-2xl font-bold text-gray-600 dark:bg-gray-700">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">
            {name}
          </h3>
          {role && <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>}
          {bio && <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{bio}</p>}
          {actions && <div className="mt-4 flex gap-2">{actions}</div>}
        </div>
      </Card>
    );
  }
);

ProfileCard.displayName = 'ProfileCard';

/**
 * Image Card Component
 * 
 * Card with an image header.
 */
export interface ImageCardProps extends Omit<CardProps, 'children'> {
  image: string;
  imageAlt?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const ImageCard = forwardRef<HTMLDivElement, ImageCardProps>(
  (
    {
      image,
      imageAlt = '',
      title,
      description,
      actions,
      ...props
    },
    ref
  ) => {
    return (
      <Card ref={ref} padding="none" {...props}>
        <img
          src={image}
          alt={imageAlt}
          className="h-48 w-full rounded-t-lg object-cover"
        />
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          {description && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
          )}
          {actions && <div className="mt-4">{actions}</div>}
        </div>
      </Card>
    );
  }
);

ImageCard.displayName = 'ImageCard';
