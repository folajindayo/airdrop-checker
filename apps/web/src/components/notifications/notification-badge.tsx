'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface NotificationBadgeProps {
  count?: number;
  max?: number;
  showZero?: boolean;
  dot?: boolean;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  children?: React.ReactNode;
  className?: string;
}

export function NotificationBadge({
  count = 0,
  max = 99,
  showZero = false,
  dot = false,
  variant = 'destructive',
  position = 'top-right',
  children,
  className,
}: NotificationBadgeProps) {
  const shouldShow = count > 0 || showZero;
  const displayCount = count > max ? `${max}+` : count;

  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1',
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    destructive: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  if (!shouldShow) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative inline-block', className)}>
      {children}
      <span
        className={cn(
          'absolute flex items-center justify-center rounded-full font-semibold text-xs',
          positionClasses[position],
          variantClasses[variant],
          dot ? 'h-2 w-2' : 'min-w-[18px] h-[18px] px-1'
        )}
      >
        {!dot && displayCount}
      </span>
    </div>
  );
}

// Notification badge for icons
export function IconNotificationBadge({
  icon,
  count = 0,
  max = 99,
  variant = 'destructive',
  className,
}: {
  icon: React.ReactNode;
  count?: number;
  max?: number;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  className?: string;
}) {
  return (
    <NotificationBadge count={count} max={max} variant={variant} className={className}>
      {icon}
    </NotificationBadge>
  );
}

// Pulsing notification dot
export function PulsingNotificationDot({
  variant = 'destructive',
  size = 'default',
  className,
}: {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    default: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const variantClasses = {
    default: 'bg-primary',
    destructive: 'bg-red-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  return (
    <span className={cn('relative flex', sizeClasses[size], className)}>
      <span
        className={cn(
          'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
          variantClasses[variant]
        )}
      />
      <span
        className={cn(
          'relative inline-flex rounded-full',
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
    </span>
  );
}

// Status badge with text
export function StatusBadge({
  status,
  children,
  className,
}: {
  status: 'online' | 'offline' | 'away' | 'busy';
  children?: React.ReactNode;
  className?: string;
}) {
  const statusConfig = {
    online: { color: 'bg-green-500', label: 'Online' },
    offline: { color: 'bg-gray-500', label: 'Offline' },
    away: { color: 'bg-yellow-500', label: 'Away' },
    busy: { color: 'bg-red-500', label: 'Busy' },
  };

  const config = statusConfig[status];

  return (
    <div className={cn('relative inline-block', className)}>
      {children}
      <span className="absolute -bottom-0.5 -right-0.5">
        <span className={cn('block h-3 w-3 rounded-full border-2 border-background', config.color)} />
      </span>
    </div>
  );
}

// Notification counter
export function NotificationCounter({
  count,
  max = 99,
  label,
  variant = 'default',
  className,
}: {
  count: number;
  max?: number;
  label?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  className?: string;
}) {
  const displayCount = count > max ? `${max}+` : count;

  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    destructive: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <Badge className={cn('text-xs font-semibold', variantClasses[variant])}>
        {displayCount}
      </Badge>
    </div>
  );
}

// Airdrop notification badge
export function AirdropNotificationBadge({
  newAirdrops,
  eligibleAirdrops,
  children,
  className,
}: {
  newAirdrops?: number;
  eligibleAirdrops?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const totalCount = (newAirdrops || 0) + (eligibleAirdrops || 0);

  return (
    <NotificationBadge
      count={totalCount}
      variant="success"
      position="top-right"
      className={className}
    >
      {children}
    </NotificationBadge>
  );
}

// Unread messages badge
export function UnreadMessagesBadge({
  count,
  children,
  className,
}: {
  count: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <NotificationBadge
      count={count}
      variant="destructive"
      position="top-right"
      className={className}
    >
      {children}
    </NotificationBadge>
  );
}

// Activity indicator
export function ActivityIndicator({
  active = false,
  label,
  variant = 'success',
  showLabel = true,
  className,
}: {
  active?: boolean;
  label?: string;
  variant?: 'success' | 'warning' | 'destructive';
  showLabel?: boolean;
  className?: string;
}) {
  if (!active) return null;

  const variantClasses = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    destructive: 'bg-red-500',
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <PulsingNotificationDot variant={variant} size="sm" />
      {showLabel && (
        <span className="text-sm font-medium">
          {label || 'Active'}
        </span>
      )}
    </div>
  );
}

// Notification list item with badge
export function NotificationListItem({
  title,
  description,
  timestamp,
  read = false,
  variant = 'default',
  onClick,
  className,
}: {
  title: string;
  description?: string;
  timestamp: Date;
  read?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  onClick?: () => void;
  className?: string;
}) {
  const variantColors = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    destructive: 'bg-red-500',
  };

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg cursor-pointer transition-colors hover:bg-accent',
        !read && 'bg-accent/50',
        className
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0 mt-1">
        {!read ? (
          <div className={cn('h-2 w-2 rounded-full', variantColors[variant])} />
        ) : (
          <div className="h-2 w-2" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', !read && 'font-semibold')}>
          {title}
        </p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {timestamp.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// Combined notification badge with dropdown preview
export function NotificationBadgeWithPreview({
  notifications,
  children,
  onClear,
  className,
}: {
  notifications: Array<{
    id: string;
    title: string;
    read: boolean;
  }>;
  children: React.ReactNode;
  onClear?: () => void;
  className?: string;
}) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationBadge
      count={unreadCount}
      variant="destructive"
      className={className}
    >
      {children}
    </NotificationBadge>
  );
}

// Wallet activity badge
export function WalletActivityBadge({
  activeTransactions,
  pendingTransactions,
  children,
  className,
}: {
  activeTransactions?: number;
  pendingTransactions?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const hasActivity = (activeTransactions || 0) + (pendingTransactions || 0) > 0;

  if (!hasActivity) {
    return <>{children}</>;
  }

  return (
    <NotificationBadge
      dot={true}
      variant="warning"
      position="bottom-right"
      className={className}
    >
      {children}
    </NotificationBadge>
  );
}

// Score change indicator
export function ScoreChangeIndicator({
  previousScore,
  currentScore,
  className,
}: {
  previousScore: number;
  currentScore: number;
  className?: string;
}) {
  const change = currentScore - previousScore;
  const isPositive = change > 0;
  const isNegative = change < 0;

  if (change === 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
        isPositive && 'bg-green-500/10 text-green-500',
        isNegative && 'bg-red-500/10 text-red-500',
        className
      )}
    >
      {isPositive && '+'}
      {change}
    </span>
  );
}

