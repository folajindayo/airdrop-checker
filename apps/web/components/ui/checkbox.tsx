'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };

// Checkbox with label
export function CheckboxWithLabel({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: {
  id?: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start space-x-3', className)}>
      <Checkbox
        id={id || label}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-1"
      />
      <div className="flex-1 space-y-1">
        <label
          htmlFor={id || label}
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

// Checkbox group
export function CheckboxGroup({
  items,
  selectedItems,
  onSelectionChange,
  className,
}: {
  items: Array<{ id: string; label: string; description?: string }>;
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  className?: string;
}) {
  const handleToggle = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onSelectionChange(selectedItems.filter((id) => id !== itemId));
    } else {
      onSelectionChange([...selectedItems, itemId]);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => (
        <CheckboxWithLabel
          key={item.id}
          id={item.id}
          label={item.label}
          description={item.description}
          checked={selectedItems.includes(item.id)}
          onCheckedChange={() => handleToggle(item.id)}
        />
      ))}
    </div>
  );
}

// Indeterminate checkbox (for "select all" functionality)
export function IndeterminateCheckbox({
  checked,
  indeterminate,
  onCheckedChange,
  disabled,
  className,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <CheckboxPrimitive.Root
      checked={indeterminate ? 'indeterminate' : checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className
      )}
    >
      <CheckboxPrimitive.Indicator
        className={cn('flex items-center justify-center text-current')}
      >
        {indeterminate ? (
          <Minus className="h-4 w-4" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

// Large checkbox variant
export function LargeCheckbox({
  checked,
  onCheckedChange,
  disabled,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        'peer h-6 w-6 shrink-0 rounded-md border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className
      )}
    >
      <CheckboxPrimitive.Indicator
        className={cn('flex items-center justify-center text-current')}
      >
        <Check className="h-5 w-5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

// Checkbox card (clickable card with checkbox)
export function CheckboxCard({
  id,
  title,
  description,
  icon,
  checked,
  onCheckedChange,
  className,
}: {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'relative flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-accent',
        checked && 'border-primary bg-primary/5',
        className
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-1"
      />
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

