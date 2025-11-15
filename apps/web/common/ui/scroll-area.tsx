'use client';

import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils';

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-[1px]',
      orientation === 'horizontal' &&
        'h-2.5 flex-col border-t border-t-transparent p-[1px]',
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };

// Horizontal scroll area
export function HorizontalScrollArea({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ScrollArea className={cn('w-full whitespace-nowrap', className)}>
      <div className="flex w-max space-x-4 p-4">{children}</div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

// Vertical scroll area with fixed height
export function FixedHeightScrollArea({
  children,
  height = 'h-72',
  className,
}: {
  children: React.ReactNode;
  height?: string;
  className?: string;
}) {
  return (
    <ScrollArea className={cn(height, className)}>
      <div className="p-4">{children}</div>
    </ScrollArea>
  );
}

// Scroll area with gradient fade
export function FadeScrollArea({
  children,
  className,
  height = 'h-96',
}: {
  children: React.ReactNode;
  className?: string;
  height?: string;
}) {
  return (
    <div className="relative">
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      <ScrollArea className={cn(height, className)}>
        <div className="p-4">{children}</div>
      </ScrollArea>
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </div>
  );
}

// Sticky header scroll area
export function StickyHeaderScrollArea({
  header,
  children,
  className,
  height = 'h-96',
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  height?: string;
}) {
  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        {header}
      </div>
      <ScrollArea className={height}>
        <div className="p-4">{children}</div>
      </ScrollArea>
    </div>
  );
}

// Chat/Message scroll area (auto-scrolls to bottom)
export function ChatScrollArea({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const viewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [children]);

  return (
    <ScrollAreaPrimitive.Root className={cn('relative overflow-hidden', className)}>
      <ScrollAreaPrimitive.Viewport ref={viewportRef} className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

// Data table scroll area
export function DataTableScrollArea({
  children,
  className,
  maxHeight = 'max-h-[600px]',
}: {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}) {
  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <ScrollArea className={maxHeight}>
        {children}
      </ScrollArea>
    </div>
  );
}

// Code block scroll area
export function CodeBlockScrollArea({
  code,
  language = 'typescript',
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  return (
    <ScrollArea className={cn('max-h-96 rounded-lg border bg-muted', className)}>
      <pre className="p-4">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

// Gallery/Grid scroll area
export function GalleryScrollArea({
  children,
  className,
  height = 'h-[500px]',
}: {
  children: React.ReactNode;
  className?: string;
  height?: string;
}) {
  return (
    <ScrollArea className={cn(height, className)}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {children}
      </div>
    </ScrollArea>
  );
}

// Sidebar scroll area
export function SidebarScrollArea({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ScrollArea className={cn('h-screen', className)}>
      <div className="p-4 space-y-2">{children}</div>
    </ScrollArea>
  );
}

