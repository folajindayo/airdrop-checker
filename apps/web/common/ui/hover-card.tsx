'use client';

import * as React from 'react';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { cn } from '@/lib/utils';

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      'z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };

// Wallet address hover card
export function WalletHoverCard({
  address,
  balance,
  ensName,
  children,
}: {
  address: string;
  balance?: string;
  ensName?: string;
  children: React.ReactNode;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-semibold">
              {ensName || 'Wallet Address'}
            </h4>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {address}
            </p>
          </div>
          {balance && (
            <div className="pt-2 border-t">
              <p className="text-sm">
                <span className="text-muted-foreground">Balance:</span>{' '}
                <span className="font-medium">{balance}</span>
              </p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

// Protocol info hover card
export function ProtocolHoverCard({
  name,
  description,
  logo,
  tvl,
  chains,
  children,
}: {
  name: string;
  description: string;
  logo?: string;
  tvl?: string;
  chains?: string[];
  children: React.ReactNode;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-96">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            {logo && (
              <img
                src={logo}
                alt={name}
                className="h-10 w-10 rounded-lg"
              />
            )}
            <div className="flex-1">
              <h4 className="text-sm font-semibold">{name}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            </div>
          </div>
          {(tvl || chains) && (
            <div className="pt-2 border-t space-y-2">
              {tvl && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">TVL:</span>
                  <span className="font-medium">{tvl}</span>
                </div>
              )}
              {chains && chains.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">
                    Chains:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {chains.map((chain) => (
                      <span
                        key={chain}
                        className="text-xs bg-secondary px-2 py-0.5 rounded"
                      >
                        {chain}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

// User profile hover card
export function UserProfileHoverCard({
  name,
  username,
  avatar,
  bio,
  stats,
  children,
}: {
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  stats?: Array<{ label: string; value: string }>;
  children: React.ReactNode;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h4 className="text-sm font-semibold">{name}</h4>
              {username && (
                <p className="text-xs text-muted-foreground">@{username}</p>
              )}
            </div>
          </div>
          {bio && (
            <p className="text-sm text-muted-foreground line-clamp-3">{bio}</p>
          )}
          {stats && stats.length > 0 && (
            <div className="pt-2 border-t grid grid-cols-3 gap-2">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

// Info hover card (simple)
export function InfoHoverCard({
  title,
  description,
  children,
}: {
  title?: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-72">
        {title && <h4 className="text-sm font-semibold mb-2">{title}</h4>}
        <p className="text-sm text-muted-foreground">{description}</p>
      </HoverCardContent>
    </HoverCard>
  );
}

// Stats hover card
export function StatsHoverCard({
  stats,
  children,
}: {
  stats: Array<{ label: string; value: string | number; icon?: React.ReactNode }>;
  children: React.ReactNode;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-64">
        <div className="space-y-2">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {stat.icon && <span className="text-muted-foreground">{stat.icon}</span>}
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <span className="text-sm font-semibold">{stat.value}</span>
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

