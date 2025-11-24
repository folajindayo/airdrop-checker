'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };

// Wallet Avatar (generates avatar from address)
export function WalletAvatar({
  address,
  size = 'md',
  className,
}: {
  address: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  // Generate consistent color from address
  const getColorFromAddress = (addr: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-cyan-500',
    ];
    const hash = addr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const initials = address.slice(2, 4).toUpperCase();
  const bgColor = getColorFromAddress(address);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarFallback className={cn(bgColor, 'text-white font-semibold')}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

// User Avatar with name
export function UserAvatar({
  name,
  imageUrl,
  size = 'md',
  className,
}: {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}

// Avatar Group
export function AvatarGroup({
  avatars,
  max = 3,
  size = 'md',
  className,
}: {
  avatars: Array<{ name?: string; imageUrl?: string; address?: string }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((avatar, index) => (
        <div
          key={index}
          className="ring-2 ring-background rounded-full"
          style={{ zIndex: visible.length - index }}
        >
          {avatar.address ? (
            <WalletAvatar
              address={avatar.address}
              size={size}
            />
          ) : (
            <UserAvatar
              name={avatar.name || 'User'}
              imageUrl={avatar.imageUrl}
              size={size}
            />
          )}
        </div>
      ))}
      {remaining > 0 && (
        <Avatar
          className={cn(
            sizeClasses[size],
            'ring-2 ring-background bg-muted text-muted-foreground font-semibold'
          )}
        >
          <AvatarFallback>+{remaining}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

// Avatar with status indicator
export function AvatarWithStatus({
  name,
  imageUrl,
  status,
  size = 'md',
  className,
}: {
  name: string;
  imageUrl?: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  const statusSizes = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <UserAvatar name={name} imageUrl={imageUrl} size={size} />
      <span
        className={cn(
          'absolute bottom-0 right-0 block rounded-full ring-2 ring-background',
          statusColors[status],
          statusSizes[size]
        )}
      />
    </div>
  );
}

// Avatar with badge
export function AvatarWithBadge({
  name,
  imageUrl,
  badge,
  size = 'md',
  className,
}: {
  name: string;
  imageUrl?: string;
  badge: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  return (
    <div className={cn('relative inline-block', className)}>
      <UserAvatar name={name} imageUrl={imageUrl} size={size} />
      <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 ring-2 ring-background">
        {badge}
      </div>
    </div>
  );
}

