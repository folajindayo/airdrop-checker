'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

// Simple tooltip wrapper for convenience
export function SimpleTooltip({
  children,
  content,
  side = 'top',
  delayDuration = 200,
  className,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
  className?: string;
}) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className={className}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Info tooltip with icon
export function InfoTooltip({
  content,
  side = 'top',
  className,
}: {
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}) {
  return (
    <SimpleTooltip content={content} side={side}>
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center rounded-full w-4 h-4 text-xs text-muted-foreground hover:text-foreground transition-colors',
          className
        )}
        aria-label="More information"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </SimpleTooltip>
  );
}

// Truncated text with full content on hover
export function TruncatedTooltip({
  text,
  maxLength = 50,
  className,
}: {
  text: string;
  maxLength?: number;
  className?: string;
}) {
  const shouldTruncate = text.length > maxLength;
  const truncated = shouldTruncate
    ? `${text.substring(0, maxLength)}...`
    : text;

  if (!shouldTruncate) {
    return <span className={className}>{text}</span>;
  }

  return (
    <SimpleTooltip content={<div className="max-w-xs">{text}</div>}>
      <span className={cn('cursor-help', className)}>{truncated}</span>
    </SimpleTooltip>
  );
}

// Action tooltip with keyboard shortcut
export function ActionTooltip({
  children,
  action,
  shortcut,
  side = 'bottom',
}: {
  children: React.ReactNode;
  action: string;
  shortcut?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  return (
    <SimpleTooltip
      content={
        <div className="flex items-center gap-2">
          <span>{action}</span>
          {shortcut && (
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">
              {shortcut}
            </kbd>
          )}
        </div>
      }
      side={side}
    >
      {children}
    </SimpleTooltip>
  );
}

// Rich tooltip with title and description
export function RichTooltip({
  children,
  title,
  description,
  side = 'top',
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  return (
    <SimpleTooltip
      content={
        <div className="space-y-1 max-w-xs">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      }
      side={side}
      delayDuration={300}
    >
      {children}
    </SimpleTooltip>
  );
}

