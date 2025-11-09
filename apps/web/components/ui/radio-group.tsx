'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };

// Radio with label
export function RadioWithLabel({
  value,
  label,
  description,
  disabled,
  className,
}: {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start space-x-3', className)}>
      <RadioGroupItem value={value} disabled={disabled} className="mt-1" />
      <div className="flex-1 space-y-1">
        <label
          htmlFor={value}
          className={cn(
            'text-sm font-medium leading-none cursor-pointer',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {label}
        </label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

// Radio card (clickable card with radio)
export function RadioCard({
  value,
  title,
  description,
  icon,
  selected,
  disabled,
  className,
}: {
  value: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  selected: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={value}
      className={cn(
        'relative flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-accent',
        selected && 'border-primary bg-primary/5',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <RadioGroupItem value={value} disabled={disabled} className="mt-1" />
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          <span className="font-medium">{title}</span>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </label>
  );
}

// Radio group with cards
export function RadioGroupCards({
  value,
  onValueChange,
  options,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{
    value: string;
    title: string;
    description?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
  className?: string;
}) {
  return (
    <RadioGroup value={value} onValueChange={onValueChange} className={className}>
      {options.map((option) => (
        <RadioCard
          key={option.value}
          value={option.value}
          title={option.title}
          description={option.description}
          icon={option.icon}
          selected={value === option.value}
          disabled={option.disabled}
        />
      ))}
    </RadioGroup>
  );
}

// Radio group with labels
export function RadioGroupWithLabels({
  value,
  onValueChange,
  options,
  orientation = 'vertical',
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onValueChange}
      className={cn(
        orientation === 'horizontal' && 'flex flex-wrap gap-4',
        className
      )}
    >
      {options.map((option) => (
        <RadioWithLabel
          key={option.value}
          value={option.value}
          label={option.label}
          description={option.description}
          disabled={option.disabled}
        />
      ))}
    </RadioGroup>
  );
}

// Large radio variant
export function LargeRadioGroupItem({
  value,
  disabled,
  className,
}: {
  value: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <RadioGroupPrimitive.Item
      value={value}
      disabled={disabled}
      className={cn(
        'aspect-square h-6 w-6 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3.5 w-3.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

// Segmented control style radio group
export function SegmentedControl({
  value,
  onValueChange,
  options,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string; icon?: React.ReactNode }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex rounded-lg border bg-muted p-1',
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onValueChange(option.value)}
          className={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
            value === option.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.icon && <span className="mr-2">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
}

