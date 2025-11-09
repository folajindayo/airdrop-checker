'use client';

import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { toggleVariants } from '@/components/ui/toggle';

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: 'default',
  variant: 'default',
});

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn('flex items-center justify-center gap-1', className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };

// Icon toggle group
export function IconToggleGroup({
  value,
  onValueChange,
  items,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  items: Array<{ value: string; icon: React.ReactNode; label?: string }>;
  className?: string;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={onValueChange}
      className={className}
    >
      {items.map((item) => (
        <ToggleGroupItem
          key={item.value}
          value={item.value}
          aria-label={item.label || item.value}
        >
          {item.icon}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

// Segmented control (single selection)
export function SegmentedControl({
  value,
  onValueChange,
  options,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={onValueChange}
      className={cn('rounded-lg border bg-muted p-1', className)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className="rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

// Multi-select toggle group
export function MultiSelectToggleGroup({
  value,
  onValueChange,
  options,
  className,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: Array<{ value: string; label: string; icon?: React.ReactNode }>;
  className?: string;
}) {
  return (
    <ToggleGroup
      type="multiple"
      value={value}
      onValueChange={onValueChange}
      className={cn('flex-wrap', className)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className="gap-2"
        >
          {option.icon}
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

// View mode toggle (grid/list)
export function ViewModeToggle({
  value,
  onValueChange,
  className,
}: {
  value: 'grid' | 'list';
  onValueChange: (value: 'grid' | 'list') => void;
  className?: string;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => val && onValueChange(val as 'grid' | 'list')}
      className={className}
    >
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

// Text alignment toggle
export function TextAlignToggle({
  value,
  onValueChange,
  className,
}: {
  value: 'left' | 'center' | 'right' | 'justify';
  onValueChange: (value: 'left' | 'center' | 'right' | 'justify') => void;
  className?: string;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) =>
        val && onValueChange(val as 'left' | 'center' | 'right' | 'justify')
      }
      className={className}
    >
      <ToggleGroupItem value="left" aria-label="Align left">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h10M4 18h16"
          />
        </svg>
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M7 12h10M4 18h16"
          />
        </svg>
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M10 12h10M4 18h16"
          />
        </svg>
      </ToggleGroupItem>
      <ToggleGroupItem value="justify" aria-label="Justify">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

// Filter toggle group
export function FilterToggleGroup({
  value,
  onValueChange,
  filters,
  className,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  filters: Array<{ value: string; label: string; count?: number }>;
  className?: string;
}) {
  return (
    <ToggleGroup
      type="multiple"
      value={value}
      onValueChange={onValueChange}
      className={cn('flex-wrap justify-start', className)}
    >
      {filters.map((filter) => (
        <ToggleGroupItem
          key={filter.value}
          value={filter.value}
          className="gap-2"
        >
          <span>{filter.label}</span>
          {filter.count !== undefined && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({filter.count})
            </span>
          )}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

