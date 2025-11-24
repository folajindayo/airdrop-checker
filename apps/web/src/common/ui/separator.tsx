'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = 'horizontal', decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };

// Separator with text
export function SeparatorWithText({
  text,
  orientation = 'horizontal',
  className,
}: {
  text: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}) {
  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <Separator orientation="vertical" className="flex-1" />
        <span className="text-xs text-muted-foreground whitespace-nowrap px-2">
          {text}
        </span>
        <Separator orientation="vertical" className="flex-1" />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Separator className="flex-1" />
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {text}
      </span>
      <Separator className="flex-1" />
    </div>
  );
}

// Dotted separator
export function DottedSeparator({
  orientation = 'horizontal',
  className,
}: {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'border-border',
        orientation === 'horizontal'
          ? 'border-t border-dotted w-full'
          : 'border-l border-dotted h-full',
        className
      )}
    />
  );
}

// Dashed separator
export function DashedSeparator({
  orientation = 'horizontal',
  className,
}: {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'border-border',
        orientation === 'horizontal'
          ? 'border-t border-dashed w-full'
          : 'border-l border-dashed h-full',
        className
      )}
    />
  );
}

// Thick separator
export function ThickSeparator({
  orientation = 'horizontal',
  className,
}: {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}) {
  return (
    <Separator
      orientation={orientation}
      className={cn(
        orientation === 'horizontal' ? 'h-[2px]' : 'w-[2px]',
        className
      )}
    />
  );
}

// Gradient separator
export function GradientSeparator({
  orientation = 'horizontal',
  className,
}: {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}) {
  return (
    <div
      className={cn(
        orientation === 'horizontal'
          ? 'h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent'
          : 'w-[1px] h-full bg-gradient-to-b from-transparent via-border to-transparent',
        className
      )}
    />
  );
}

// Separator with icon
export function SeparatorWithIcon({
  icon,
  orientation = 'horizontal',
  className,
}: {
  icon: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}) {
  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <Separator orientation="vertical" className="flex-1" />
        <div className="p-1 bg-background">{icon}</div>
        <Separator orientation="vertical" className="flex-1" />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Separator className="flex-1" />
      <div className="p-1 bg-background">{icon}</div>
      <Separator className="flex-1" />
    </div>
  );
}

// Section separator with title
export function SectionSeparator({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative py-4', className)}>
      <Separator className="absolute top-1/2 w-full" />
      <div className="relative flex justify-center">
        <div className="bg-background px-4">
          <div className="text-center">
            <h3 className="text-sm font-semibold">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

